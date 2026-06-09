namespace EMS.API.Models
{
    public class Hotel
    {
        public int HotelID { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string? Address { get; set; }

        // Navigation properties
        public ICollection<ConferenceRoom> ConferenceRooms { get; set; } = new List<ConferenceRoom>();
    }
}