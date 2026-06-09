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
    public class HotelsController : ControllerBase
    {
        private readonly EMSContext _context;
        private readonly IMapper _mapper;

        public HotelsController(EMSContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/hotels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HotelResponseDTO>>> GetHotels()
        {
            var hotels = await _context.Hotels
                .Include(h => h.ConferenceRooms)
                    .ThenInclude(r => r.RoomTimeSlots)
                .ToListAsync();

            return Ok(_mapper.Map<List<HotelResponseDTO>>(hotels));
        }

        // GET: api/hotels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HotelResponseDTO>> GetHotel(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.ConferenceRooms)
                    .ThenInclude(r => r.RoomTimeSlots)
                .FirstOrDefaultAsync(h => h.HotelID == id);

            if (hotel == null) return NotFound();

            return Ok(_mapper.Map<HotelResponseDTO>(hotel));
        }

        // POST: api/hotels
        [HttpPost]
        public async Task<ActionResult<HotelResponseDTO>> CreateHotel(CreateHotelDTO dto)
        {
            var hotel = _mapper.Map<Hotel>(dto);
            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHotel),
                new { id = hotel.HotelID },
                _mapper.Map<HotelResponseDTO>(hotel));
        }

        // POST: api/hotels/rooms
        [HttpPost("rooms")]
        public async Task<ActionResult<RoomResponseDTO>> AddRoom(CreateRoomDTO dto)
        {
            var hotel = await _context.Hotels.FindAsync(dto.HotelID);
            if (hotel == null) return NotFound("Hotel not found");

            var room = _mapper.Map<ConferenceRoom>(dto);
            _context.ConferenceRooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<RoomResponseDTO>(room));
        }

        // POST: api/hotels/timeslots
        [HttpPost("timeslots")]
        public async Task<ActionResult<TimeSlotResponseDTO>> AddTimeSlot(CreateTimeSlotDTO dto)
        {
            var room = await _context.ConferenceRooms.FindAsync(dto.RoomID);
            if (room == null) return NotFound("Room not found");

            var slot = _mapper.Map<RoomTimeSlot>(dto);
            _context.RoomTimeSlots.Add(slot);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<TimeSlotResponseDTO>(slot));
        }

        // DELETE: api/hotels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null) return NotFound();

            _context.Hotels.Remove(hotel);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}