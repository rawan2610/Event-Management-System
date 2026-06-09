namespace EMS.API.Models
{
    public class Reservation
    {
        public int ReservationID { get; set; }
        public int InvestorID { get; set; }
        public int PresenterID { get; set; }
        public int SlotID { get; set; }
        public int SectorID { get; set; }
        public DateTime ReservationDate { get; set; } = DateTime.Now;

        // Navigation properties
        public Investor Investor { get; set; } = null!;
        public Presenter Presenter { get; set; } = null!;
        public RoomTimeSlot RoomTimeSlot { get; set; } = null!;
        public Sector Sector { get; set; } = null!;
    }
}