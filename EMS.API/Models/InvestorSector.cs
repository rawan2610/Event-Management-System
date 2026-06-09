namespace EMS.API.Models
{
    public class InvestorSector
    {
        public int InvestorSectorID { get; set; }
        public int InvestorID { get; set; }
        public int SectorID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }

        // Navigation properties
        public Investor Investor { get; set; } = null!;
        public Sector Sector { get; set; } = null!;
    }
}