using Microsoft.EntityFrameworkCore;
using LogosAPI.Models;

namespace LogosAPI.Data
{
    public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Provider> Providers { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<InsuranceAuthorization> InsuranceAuthorizations { get; set; }
        public DbSet<InsuranceAuthorizationSnapshot> InsuranceAuthorizationSnapshots { get; set; }
        public DbSet<TreatmentSession> TreatmentSessions { get; set; }
        //public DbSet<TreatmentSessionSnapshot> TreatmentSessionSnapshots { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Insurance> Insurances { get; set; }
        public DbSet<ProviderNotificationSubscription> ProviderNotificationSubscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Provider>()
                .HasKey(p => p.Slug);

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.ProviderSlug)
                .IsUnique(false);

            modelBuilder.Entity<InsuranceAuthorization>()
                .HasIndex(a => new { a.ProviderSlug, a.PatientId })
                .IsUnique(false);

            modelBuilder.Entity<TreatmentSession>()
                .HasIndex(s => new { s.ProviderSlug, s.PatientId, s.InsuranceAuthorizationId })
                .IsUnique(false);

            modelBuilder.Entity<ProviderNotificationSubscription>()
                .HasIndex(s => s.ProviderSlug)
                .IsUnique(false);

            modelBuilder.Entity<ProviderNotificationSubscription>()
                .HasIndex(s => new { s.UserEmail, s.ProviderSlug })
                .IsUnique(true);
        }
    }
}
