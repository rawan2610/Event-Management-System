namespace EMS.API.Models
{
    public class PresenterSector
    {
        public int PresenterSectorID { get; set; }
        public int PresenterID { get; set; }
        public int SectorID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }

        // Navigation properties
        public Presenter Presenter { get; set; } = null!;
        public Sector Sector { get; set; } = null!;
    }
}