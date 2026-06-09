using AutoMapper;
using EMS.API.DTOs;
using EMS.API.Models;

namespace EMS.API
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Hotel mappings
            CreateMap<Hotel, HotelResponseDTO>()
                .ForMember(dest => dest.ConferenceRooms, opt => opt.MapFrom(src => src.ConferenceRooms));
            CreateMap<CreateHotelDTO, Hotel>();

            // Room mappings
            CreateMap<ConferenceRoom, RoomResponseDTO>()
                .ForMember(dest => dest.RoomTimeSlots, opt => opt.MapFrom(src => src.RoomTimeSlots));
            CreateMap<CreateRoomDTO, ConferenceRoom>();

            // TimeSlot mappings
            CreateMap<RoomTimeSlot, TimeSlotResponseDTO>();
            CreateMap<CreateTimeSlotDTO, RoomTimeSlot>();

            // Investor mappings
            CreateMap<Investor, InvestorResponseDTO>()
                .ForMember(dest => dest.InvestorSectors, opt => opt.MapFrom(src => src.InvestorSectors));
            CreateMap<CreateInvestorDTO, Investor>();

            // InvestorSector mappings
            CreateMap<InvestorSector, InvestorSectorResponseDTO>()
                .ForMember(dest => dest.SectorName, opt => opt.MapFrom(src => src.Sector.SectorName));
            CreateMap<CreateInvestorSectorDTO, InvestorSector>();

            // Presenter mappings
            CreateMap<Presenter, PresenterResponseDTO>()
                .ForMember(dest => dest.PresenterSectors, opt => opt.MapFrom(src => src.PresenterSectors));
            CreateMap<CreatePresenterDTO, Presenter>();

            // PresenterSector mappings
            CreateMap<PresenterSector, PresenterSectorResponseDTO>()
                .ForMember(dest => dest.SectorName, opt => opt.MapFrom(src => src.Sector.SectorName));
            CreateMap<CreatePresenterSectorDTO, PresenterSector>();

            // Sector mappings
            CreateMap<Sector, SectorResponseDTO>();

            // Reservation mappings
            CreateMap<Reservation, ReservationResponseDTO>()
                .ForMember(dest => dest.InvestorName, opt => opt.MapFrom(src => src.Investor.Name))
                .ForMember(dest => dest.PresenterName, opt => opt.MapFrom(src => src.Presenter.Name))
                .ForMember(dest => dest.SectorName, opt => opt.MapFrom(src => src.Sector.SectorName))
                .ForMember(dest => dest.TimeFrom, opt => opt.MapFrom(src => src.RoomTimeSlot.TimeFrom))
                .ForMember(dest => dest.TimeTo, opt => opt.MapFrom(src => src.RoomTimeSlot.TimeTo))
                .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.RoomTimeSlot.ConferenceRoom.RoomName))
                .ForMember(dest => dest.HotelName, opt => opt.MapFrom(src => src.RoomTimeSlot.ConferenceRoom.Hotel.HotelName));
            CreateMap<CreateReservationDTO, Reservation>();
        }
    }
}