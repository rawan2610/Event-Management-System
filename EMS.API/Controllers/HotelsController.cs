using EMS.API.DTOs;
using AutoMapper;
using EMS.API.Data;
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

            // Check if room name already exists in this hotel
            var existingRoom = await _context.ConferenceRooms
                .AnyAsync(r => r.HotelID == dto.HotelID && r.RoomName == dto.RoomName);
            if (existingRoom) return BadRequest("A room with this name already exists in this hotel");

            var room = new ConferenceRoom
            {
                HotelID = dto.HotelID,
                RoomName = dto.RoomName
            };

            _context.ConferenceRooms.Add(room);
            await _context.SaveChangesAsync();

            // Get slot duration from settings
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == "SlotDurationMinutes");
            int slotDuration = setting != null ? int.Parse(setting.Value) : 60;

            // Auto generate time slots if availability times provided
            if (dto.AvailableFrom.HasValue && dto.AvailableTo.HasValue)
            {
                var current = dto.AvailableFrom.Value;
                while (current.AddMinutes(slotDuration) <= dto.AvailableTo.Value)
                {
                    _context.RoomTimeSlots.Add(new RoomTimeSlot
                    {
                        RoomID = room.RoomID,
                        TimeFrom = current,
                        TimeTo = current.AddMinutes(slotDuration),
                        IsAvailable = true
                    });
                    current = current.AddMinutes(slotDuration);
                }
                await _context.SaveChangesAsync();
            }

            var result = await _context.ConferenceRooms
                .Include(r => r.RoomTimeSlots)
                .FirstOrDefaultAsync(r => r.RoomID == room.RoomID);

            return Ok(_mapper.Map<RoomResponseDTO>(result));
        }




        //old approach
        //// POST: api/hotels/rooms
        //[HttpPost("rooms")]
        //public async Task<ActionResult<RoomResponseDTO>> AddRoom(CreateRoomDTO dto)
        //{
        //    var hotel = await _context.Hotels.FindAsync(dto.HotelID);
        //    if (hotel == null) return NotFound("Hotel not found");

        //    var room = _mapper.Map<ConferenceRoom>(dto);
        //    _context.ConferenceRooms.Add(room);
        //    await _context.SaveChangesAsync();

        //    return Ok(_mapper.Map<RoomResponseDTO>(room));
        //}

        //// POST: api/hotels/timeslots
        //[HttpPost("timeslots")]
        //public async Task<ActionResult<TimeSlotResponseDTO>> AddTimeSlot(CreateTimeSlotDTO dto)
        //{
        //    var room = await _context.ConferenceRooms.FindAsync(dto.RoomID);
        //    if (room == null) return NotFound("Room not found");

        //    // Check if time slot already exists for this room
        //    var existingSlot = await _context.RoomTimeSlots
        //        .AnyAsync(s => s.RoomID == dto.RoomID &&
        //                       s.TimeFrom == dto.TimeFrom &&
        //                       s.TimeTo == dto.TimeTo);

        //    if (existingSlot)
        //        return BadRequest("This time slot already exists for this room");

        //    // Check if time slot overlaps with existing slots
        //    var overlappingSlot = await _context.RoomTimeSlots
        //        .AnyAsync(s => s.RoomID == dto.RoomID &&
        //                       s.TimeFrom < dto.TimeTo &&
        //                       s.TimeTo > dto.TimeFrom);

        //    if (overlappingSlot)
        //        return BadRequest("This time slot overlaps with an existing slot for this room");

        //    var slot = _mapper.Map<RoomTimeSlot>(dto);
        //    _context.RoomTimeSlots.Add(slot);
        //    await _context.SaveChangesAsync();

        //    return Ok(_mapper.Map<TimeSlotResponseDTO>(slot));
        //}


        // POST: api/hotels/rooms/{id}/regenerate
        [HttpPost("rooms/{id}/regenerate")]
        public async Task<ActionResult> RegenerateSlots(int id, [FromBody] RegenerateSlotsDTO dto)
        {
            var room = await _context.ConferenceRooms
                .Include(r => r.RoomTimeSlots)
                .FirstOrDefaultAsync(r => r.RoomID == id);

            if (room == null) return NotFound("Room not found");

            // Check if any slots are reserved
            var hasReservedSlots = room.RoomTimeSlots.Any(s => !s.IsAvailable);
            if (hasReservedSlots)
                return BadRequest("Cannot regenerate slots because some slots are already reserved");

            // Get slot duration from settings
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == "SlotDurationMinutes");
            int slotDuration = setting != null ? int.Parse(setting.Value) : 60;

            // Delete all existing available slots
            _context.RoomTimeSlots.RemoveRange(room.RoomTimeSlots);
            await _context.SaveChangesAsync();

            // Generate new slots
            var current = dto.AvailableFrom;
            while (current.AddMinutes(slotDuration) <= dto.AvailableTo)
            {
                _context.RoomTimeSlots.Add(new RoomTimeSlot
                {
                    RoomID = id,
                    TimeFrom = current,
                    TimeTo = current.AddMinutes(slotDuration),
                    IsAvailable = true
                });
                current = current.AddMinutes(slotDuration);
            }

            await _context.SaveChangesAsync();

            var result = await _context.ConferenceRooms
                .Include(r => r.RoomTimeSlots)
                .FirstOrDefaultAsync(r => r.RoomID == id);

            return Ok(_mapper.Map<RoomResponseDTO>(result));
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

        // PUT: api/hotels/5
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateHotel(int id, CreateHotelDTO dto)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null) return NotFound();

            hotel.HotelName = dto.HotelName;
            hotel.Address = dto.Address;
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<HotelResponseDTO>(hotel));
        }

        // PUT: api/hotels/rooms/{id}
        [HttpPut("rooms/{id}")]
        public async Task<ActionResult> UpdateRoom(int id, CreateRoomDTO dto)
        {
            var room = await _context.ConferenceRooms.FindAsync(id);
            if (room == null) return NotFound();

            room.RoomName = dto.RoomName;
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<RoomResponseDTO>(room));
        }

        // DELETE: api/hotels/rooms/{id}
        [HttpDelete("rooms/{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.ConferenceRooms.FindAsync(id);
            if (room == null) return NotFound();

            _context.ConferenceRooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/hotels/timeslots/{id}
        [HttpDelete("timeslots/{id}")]
        public async Task<IActionResult> DeleteTimeSlot(int id)
        {
            var slot = await _context.RoomTimeSlots.FindAsync(id);
            if (slot == null) return NotFound();

            _context.RoomTimeSlots.Remove(slot);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}