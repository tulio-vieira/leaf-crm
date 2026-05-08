using WebAPI.Models;

namespace WebAPI.Data;

public class DataSeeder(DataContext context)
{
    private static readonly Random Rng = new(42);

    public async Task SeedAsync()
    {
        await CreateUsers();
        await context.SaveChangesAsync();
    }

    private async Task CreateUsers()
    {
        var role = new Role
        {
            Name = "Admin",
            Permissions = "*",
        };
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = new User
        {
            Email = "admin@example.com",
            Name = "Admin",
            IsEmailConfirmed = true,
            // Admin1234
            PasswordHash = "AQAAAAIAAYagAAAAEPi7rAv21K75w0kXmhHeyPHIOYZgBKLeIfoZ5RiKcQP0EmxUPbtIQ3y/cdzpvgFpkg==",
            RoleId = role.Id,
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }
}
