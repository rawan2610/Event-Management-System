namespace EMS.API.Models
{
    public class RoomTimeSlot
    {
        public int SlotID { get; set; }
        public int RoomID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
        public bool IsAvailable { get; set; } = true;

        // Navigation properties
        public ConferenceRoom ConferenceRoom { get; set; } = null!;
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}