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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<NotificationSubscription>()
                .HasIndex(s => new { s.UserEmail })
                .IsUnique(true);

            modelBuilder.Entity<Board>()
                .OwnsMany(b => b.Columns, builder => builder.ToJson());

            modelBuilder.Entity<Lead>()
                .HasOne(l => l.Board)
                .WithMany(b => b.Leads)
                .HasForeignKey(l => l.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
