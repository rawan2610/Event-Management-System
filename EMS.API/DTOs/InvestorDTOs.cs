namespace EMS.API.DTOs
{
    public class CreateInvestorDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public List<CreateInvestorSectorDTO> InvestorSectors { get; set; } = new();
    }

    public class CreateInvestorSectorDTO
    {
        public int SectorID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
    }

    public class InvestorResponseDTO
    {
        public int InvestorID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public List<InvestorSectorResponseDTO> InvestorSectors { get; set; } = new();
    }

    public class InvestorSectorResponseDTO
    {
        public int InvestorSectorID { get; set; }
        public int SectorID { get; set; }
        public string SectorName { get; set; } = string.Empty;
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
    }
}