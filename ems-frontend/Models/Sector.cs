namespace EMS.API.Models
{
    public class Sector
    {
        public int SectorID { get; set; }
        public string SectorName { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<InvestorSector> InvestorSectors { get; set; } = new List<InvestorSector>();
        public ICollection<PresenterSector> PresenterSectors { get; set; } = new List<PresenterSector>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}