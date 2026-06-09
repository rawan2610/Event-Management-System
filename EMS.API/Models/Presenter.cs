namespace EMS.API.Models
{
    public class Presenter
    {
        public int PresenterID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<PresenterSector> PresenterSectors { get; set; } = new List<PresenterSector>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}