using LeafAPI.Interfaces;
using LeafAPI.Models;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Data
{
    public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationSubscription> NotificationSubscriptions { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<Lead> Leads { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<InfinitePayIntegration> InfinitePayIntegrations { get; set; }
        public DbSet<LoggiIntegration> LoggiIntegrations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Board>()
                .OwnsMany(b => b.Columns, builder => builder.ToJson());

            modelBuilder.Entity<Board>()
                .OwnsOne(b => b.InfinitePaySetting);

            modelBuilder.Entity<Board>()
                .OwnsOne(b => b.LoggiSetting);

            modelBuilder.Entity<Lead>()
                .Property(l => l.Position)
                .UseCollation("C");

            modelBuilder.Entity<Integration>().UseTpcMappingStrategy();

            modelBuilder.Entity<InfinitePayIntegration>()
                .OwnsOne(i => i.Webhook, wb =>
                {
                    wb.Property(w => w.RequestSent).HasColumnType("jsonb");
                    wb.Property(w => w.ResponsePayload).HasColumnType("jsonb");
                    wb.Property(w => w.PayloadReceived).HasColumnType("jsonb");
                });

            modelBuilder.Entity<LoggiIntegration>()
                .OwnsOne(i => i.Webhook, wb =>
                {
                    wb.Property(w => w.RequestSent).HasColumnType("jsonb");
                    wb.Property(w => w.ResponsePayload).HasColumnType("jsonb");
                    wb.Property(w => w.PayloadReceived).HasColumnType("jsonb");
                });
        }
    }
}
