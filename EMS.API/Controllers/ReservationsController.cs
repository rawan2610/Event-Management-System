using AutoMapper;
using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly EMSContext _context;
        private readonly IMapper _mapper;

        public ReservationsController(EMSContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/reservations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationResponseDTO>>> GetReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Investor)
                .Include(r => r.Presenter)
                .Include(r => r.Sector)
                .Include(r => r.RoomTimeSlot)
                    .ThenInclude(s => s.ConferenceRoom)
                        .ThenInclude(c => c.Hotel)
                .ToListAsync();

            return Ok(_mapper.Map<List<ReservationResponseDTO>>(reservations));
        }

        // GET: api/reservations/matches/5
        [HttpGet("matches/{investorId}")]
        public async Task<ActionResult<IEnumerable<MatchResultDTO>>> GetMatches(int investorId)
        {
            var investor = await _context.Investors
                .Include(i => i.InvestorSectors)
                    .ThenInclude(s => s.Sector)
                .FirstOrDefaultAsync(i => i.InvestorID == investorId);

            if (investor == null) return NotFound("Investor not found");

            var results = new List<MatchResultDTO>();

            foreach (var investorSector in investor.InvestorSectors)
            {
                // Find presenters with same sector
                var matchingPresenters = await _context.PresenterSectors
                    .Include(ps => ps.Presenter)
                    .Include(ps => ps.Sector)
                    .Where(ps => ps.SectorID == investorSector.SectorID)
                    .ToListAsync();

                foreach (var presenterSector in matchingPresenters)
                {
                    // Calculate time overlap first
                    var overlapFrom = investorSector.TimeFrom > presenterSector.TimeFrom
                        ? investorSector.TimeFrom
                        : presenterSector.TimeFrom;

                    var overlapTo = investorSector.TimeTo < presenterSector.TimeTo
                        ? investorSector.TimeTo
                        : presenterSector.TimeTo;

                    // Check if overlap is at least 1 hour
                    if (overlapTo <= overlapFrom) continue;
                    if ((overlapTo - overlapFrom).TotalHours < 1) continue;

                    // Check investor is not already booked during overlap
                    var investorBooked = await _context.Reservations
                        .Include(r => r.RoomTimeSlot)
                        .AnyAsync(r => r.InvestorID == investorId &&
                                       r.RoomTimeSlot.TimeFrom < overlapTo &&
                                       r.RoomTimeSlot.TimeTo > overlapFrom);

                    if (investorBooked) continue;

                    // Check presenter is not already booked during overlap
                    var presenterBooked = await _context.Reservations
                        .Include(r => r.RoomTimeSlot)
                        .AnyAsync(r => r.PresenterID == presenterSector.PresenterID &&
                                       r.RoomTimeSlot.TimeFrom < overlapTo &&
                                       r.RoomTimeSlot.TimeTo > overlapFrom);

                    if (presenterBooked) continue;

                    // Check investor and presenter haven't already met
                    var alreadyMet = await _context.Reservations
                        .AnyAsync(r => r.InvestorID == investorId &&
                                       r.PresenterID == presenterSector.PresenterID);

                    if (alreadyMet) continue;

                    // Find available rooms within overlap
                    var availableSlots = await _context.RoomTimeSlots
                        .Include(s => s.ConferenceRoom)
                            .ThenInclude(r => r.Hotel)
                        .Where(s => s.IsAvailable &&
                                    s.TimeFrom >= overlapFrom &&
                                    s.TimeTo <= overlapTo)
                        .ToListAsync();

                    if (!availableSlots.Any()) continue;

                    results.Add(new MatchResultDTO
                    {
                        PresenterID = presenterSector.PresenterID,
                        PresenterName = presenterSector.Presenter.Name,
                        PresenterMobile = presenterSector.Presenter.Mobile,
                        SectorID = investorSector.SectorID,
                        SectorName = investorSector.Sector.SectorName,
                        MatchedTimeFrom = overlapFrom,
                        MatchedTimeTo = overlapTo,
                        AvailableSlots = availableSlots.Select(s => new AvailableSlotDTO
                        {
                            SlotID = s.SlotID,
                            TimeFrom = s.TimeFrom,
                            TimeTo = s.TimeTo,
                            RoomID = s.RoomID,
                            RoomName = s.ConferenceRoom.RoomName,
                            HotelID = s.ConferenceRoom.HotelID,
                            HotelName = s.ConferenceRoom.Hotel.HotelName
                        }).ToList()
                    });
                }
            }

            return Ok(results);
        }
        // POST: api/reservations
        [HttpPost]
        public async Task<ActionResult<ReservationResponseDTO>> CreateReservation(CreateReservationDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Check slot is still available
                var slot = await _context.RoomTimeSlots
                    .Include(s => s.ConferenceRoom)
                        .ThenInclude(r => r.Hotel)
                    .FirstOrDefaultAsync(s => s.SlotID == dto.SlotID);

                if (slot == null) return NotFound("Time slot not found");
                if (!slot.IsAvailable) return BadRequest("This time slot is no longer available");

                // Check investor not already booked at this exact time
                var investorBooked = await _context.Reservations
                    .Include(r => r.RoomTimeSlot)
                    .AnyAsync(r => r.InvestorID == dto.InvestorID &&
                                   r.RoomTimeSlot.TimeFrom < slot.TimeTo &&
                                   r.RoomTimeSlot.TimeTo > slot.TimeFrom);

                if (investorBooked)
                    return BadRequest("Investor is already booked during this time slot");

                // Check presenter not already booked at this exact time
                var presenterBooked = await _context.Reservations
                    .Include(r => r.RoomTimeSlot)
                    .AnyAsync(r => r.PresenterID == dto.PresenterID &&
                                   r.RoomTimeSlot.TimeFrom < slot.TimeTo &&
                                   r.RoomTimeSlot.TimeTo > slot.TimeFrom);

                if (presenterBooked)
                    return BadRequest("Presenter is already booked during this time slot");

                // Check investor and presenter are not meeting each other already
                var alreadyMeeting = await _context.Reservations
                    .AnyAsync(r => r.InvestorID == dto.InvestorID &&
                                   r.PresenterID == dto.PresenterID);

                if (alreadyMeeting)
                    return BadRequest("This investor and presenter already have a reservation together");

                // Mark slot as unavailable
                slot.IsAvailable = false;

                // Create reservation
                var reservation = new Reservation
                {
                    InvestorID = dto.InvestorID,
                    PresenterID = dto.PresenterID,
                    SlotID = dto.SlotID,
                    SectorID = dto.SectorID,
                    ReservationDate = DateTime.Now
                };

                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = await _context.Reservations
                    .Include(r => r.Investor)
                    .Include(r => r.Presenter)
                    .Include(r => r.Sector)
                    .Include(r => r.RoomTimeSlot)
                        .ThenInclude(s => s.ConferenceRoom)
                            .ThenInclude(c => c.Hotel)
                    .FirstOrDefaultAsync(r => r.ReservationID == reservation.ReservationID);

                return CreatedAtAction(nameof(GetReservations),
                    new { id = reservation.ReservationID },
                    _mapper.Map<ReservationResponseDTO>(result));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
    }