namespace EMS.API.Models
{
    public class ConferenceRoom
    {
        public int RoomID { get; set; }
        public int HotelID { get; set; }
        public string RoomName { get; set; } = string.Empty;

        // Navigation properties
        public Hotel Hotel { get; set; } = null!;
        public ICollection<RoomTimeSlot> RoomTimeSlots { get; set; } = new List<RoomTimeSlot>();
    }
}