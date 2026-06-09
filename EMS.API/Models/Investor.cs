namespace EMS.API.Models
{
    public class Investor
    {
        public int InvestorID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<InvestorSector> InvestorSectors { get; set; } = new List<InvestorSector>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}