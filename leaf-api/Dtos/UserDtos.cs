using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class UserResponse : UserRequest
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? RoleName { get; set; }
    }

    public class ChangePasswordRequest
    {
        public required string NewPassword { get; set; }
    }

    public class UserRequest
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public bool IsEmailConfirmed { get; set; }
        public int? RoleId { get; set; }


        public User ToNewUser()
        {
            return new User
            {
                Email = Email,
                Name = Name,
                IsEmailConfirmed = IsEmailConfirmed,
                RoleId = RoleId
            };
        }
    }
}
