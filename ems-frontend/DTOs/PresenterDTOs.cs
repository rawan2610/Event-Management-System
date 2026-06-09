namespace EMS.API.DTOs
{
    public class CreatePresenterDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public List<CreatePresenterSectorDTO> PresenterSectors { get; set; } = new();
    }

    public class CreatePresenterSectorDTO
    {
        public int SectorID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
    }

    public class PresenterResponseDTO
    {
        public int PresenterID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public List<PresenterSectorResponseDTO> PresenterSectors { get; set; } = new();
    }

    public class PresenterSectorResponseDTO
    {
        public int PresenterSectorID { get; set; }
        public int SectorID { get; set; }
        public string SectorName { get; set; } = string.Empty;
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
    }
}