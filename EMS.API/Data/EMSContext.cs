using EMS.API.Models;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EMS.API.Data
{
    public class EMSContext : DbContext
    {
        public EMSContext(DbContextOptions<EMSContext> options) : base(options) { }

        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<ConferenceRoom> ConferenceRooms { get; set; }
        public DbSet<RoomTimeSlot> RoomTimeSlots { get; set; }
        public DbSet<Sector> Sectors { get; set; }
        public DbSet<Investor> Investors { get; set; }
        public DbSet<InvestorSector> InvestorSectors { get; set; }
        public DbSet<Presenter> Presenters { get; set; }
        public DbSet<PresenterSector> PresenterSectors { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        public DbSet<Setting> Settings { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define primary keys explicitly
            modelBuilder.Entity<Hotel>().HasKey(h => h.HotelID);
            modelBuilder.Entity<ConferenceRoom>().HasKey(r => r.RoomID);
            modelBuilder.Entity<RoomTimeSlot>().HasKey(s => s.SlotID);
            modelBuilder.Entity<Sector>().HasKey(s => s.SectorID);
            modelBuilder.Entity<Investor>().HasKey(i => i.InvestorID);
            modelBuilder.Entity<InvestorSector>().HasKey(i => i.InvestorSectorID);
            modelBuilder.Entity<Presenter>().HasKey(p => p.PresenterID);
            modelBuilder.Entity<PresenterSector>().HasKey(p => p.PresenterSectorID);
            modelBuilder.Entity<Reservation>().HasKey(r => r.ReservationID);

            // Hotel → ConferenceRooms
            modelBuilder.Entity<ConferenceRoom>()
                .HasOne(r => r.Hotel)
                .WithMany(h => h.ConferenceRooms)
                .HasForeignKey(r => r.HotelID);

            // ConferenceRoom → RoomTimeSlots
            modelBuilder.Entity<RoomTimeSlot>()
                .HasOne(s => s.ConferenceRoom)
                .WithMany(r => r.RoomTimeSlots)
                .HasForeignKey(s => s.RoomID);

            // Investor → InvestorSectors
            modelBuilder.Entity<InvestorSector>()
                .HasOne(i => i.Investor)
                .WithMany(i => i.InvestorSectors)
                .HasForeignKey(i => i.InvestorID);

            // Sector → InvestorSectors
            modelBuilder.Entity<InvestorSector>()
                .HasOne(i => i.Sector)
                .WithMany(s => s.InvestorSectors)
                .HasForeignKey(i => i.SectorID);

            // Presenter → PresenterSectors
            modelBuilder.Entity<PresenterSector>()
                .HasOne(p => p.Presenter)
                .WithMany(p => p.PresenterSectors)
                .HasForeignKey(p => p.PresenterID);

            // Sector → PresenterSectors
            modelBuilder.Entity<PresenterSector>()
                .HasOne(p => p.Sector)
                .WithMany(s => s.PresenterSectors)
                .HasForeignKey(p => p.SectorID);

            // Reservation relationships
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Investor)
                .WithMany(i => i.Reservations)
                .HasForeignKey(r => r.InvestorID);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Presenter)
                .WithMany(p => p.Reservations)
                .HasForeignKey(r => r.PresenterID);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.RoomTimeSlot)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SlotID);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Sector)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SectorID);

            // Seed default setting
            modelBuilder.Entity<Setting>().HasData(
                new Setting { SettingID = 1, Key = "SlotDurationMinutes", Value = "60" }
            );

            // Seed Sectors
            modelBuilder.Entity<Sector>().HasData(
                new Sector { SectorID = 1, SectorName = "Finance" },
                new Sector { SectorID = 2, SectorName = "IT" },
                new Sector { SectorID = 3, SectorName = "Restaurants" },
                new Sector { SectorID = 4, SectorName = "Real Estate" },
                new Sector { SectorID = 5, SectorName = "Retail" },
                new Sector { SectorID = 6, SectorName = "Healthcare" },
                new Sector { SectorID = 7, SectorName = "Education" },
                new Sector { SectorID = 8, SectorName = "Manufacturing" },
                new Sector { SectorID = 9, SectorName = "Tourism" },
                new Sector { SectorID = 10, SectorName = "Media" }
            );
        }
    }
}