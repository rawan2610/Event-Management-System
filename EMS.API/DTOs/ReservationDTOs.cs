namespace EMS.API.DTOs
{
    public class CreateReservationDTO
    {
        public int InvestorID { get; set; }
        public int PresenterID { get; set; }
        public int SlotID { get; set; }
        public int SectorID { get; set; }
    }

    public class ReservationResponseDTO
    {
        public int ReservationID { get; set; }
        public int InvestorID { get; set; }
        public string InvestorName { get; set; } = string.Empty;
        public int PresenterID { get; set; }
        public string PresenterName { get; set; } = string.Empty;
        public int SlotID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public string HotelName { get; set; } = string.Empty;
        public int SectorID { get; set; }
        public string SectorName { get; set; } = string.Empty;
        public DateTime ReservationDate { get; set; }
    }

    public class MatchResultDTO
    {
        public int PresenterID { get; set; }
        public string PresenterName { get; set; } = string.Empty;
        public string PresenterMobile { get; set; } = string.Empty;
        public int SectorID { get; set; }
        public string SectorName { get; set; } = string.Empty;
        public TimeOnly MatchedTimeFrom { get; set; }
        public TimeOnly MatchedTimeTo { get; set; }
        public List<AvailableSlotDTO> AvailableSlots { get; set; } = new();
    }

    public class AvailableSlotDTO
    {
        public int SlotID { get; set; }
        public TimeOnly TimeFrom { get; set; }
        public TimeOnly TimeTo { get; set; }
        public int RoomID { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int HotelID { get; set; }
        public string HotelName { get; set; } = string.Empty;
    }
}