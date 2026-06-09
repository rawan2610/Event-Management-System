namespace EMS.API.DTOs
{
    public class CreateHotelDTO
    {
        public string HotelName { get; set; } = string.Empty;
        public string? Address { get; set; }
    }

    public class HotelResponseDTO
    {
        public int HotelID { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public List<RoomResponseDTO> ConferenceRooms { get; set; } = new();
    }

    public class CreateRoomDTO
    {
        public string RoomName { get; set; } = string.Empty;
        public int HotelID { get; set; }
    }

    public class RoomResponseDTO
    {
        public int RoomID { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int HotelID { get; set; }
        public List<TimeSlotResponseDTO> RoomTimeSlots { get; set; } = new();
    }

    public class CreateTimeSlotDTO
    {
        public int RoomID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
    }

    public class TimeSlotResponseDTO
    {
        public int SlotID { get; set; }
        public int RoomID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
        public bool IsAvailable { get; set; }
    }
}