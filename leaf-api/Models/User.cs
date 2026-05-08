using LogosAPI.Dtos;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace LogosAPI.Models
{

    [Index(nameof(Email), IsUnique = true)]

    public class User
    {
        [Key]
        public Guid Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(40)]
        [MinLength(3)]
        public required string Name { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MinLength(7, ErrorMessage = "Invalid email format")]
        [StringLength(60)]
        public required string Email { get; set; }

        public bool IsEmailConfirmed { get; set; } = false;

        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(80)]
        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }

        public int? RoleId { get; set; }

        public Role? Role { get; set; }




        public UserResponse ToResponse()
        {
            return new UserResponse
            {
                Id = Id,
                CreatedAt = CreatedAt,
                Name = Name,
                Email = Email,
                IsEmailConfirmed = IsEmailConfirmed,
                RoleId = RoleId,
                RoleName = Role?.Name,
            };
        }

        public void UpdateFromRequest(UserRequest r)
        {
            Name = r.Name;
            Email = r.Email;
            RoleId = r.RoleId;
            IsEmailConfirmed = r.IsEmailConfirmed;
        }
    }
}
