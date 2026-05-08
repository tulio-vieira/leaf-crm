
using WebAPI.Dtos;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace WebAPI.Models
{
    public partial class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(60)]
        public string Name { get; set; } = string.Empty;

        public string Permissions { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

        public string? HomePage { get; set; }

        [StringLength(60)]
        public string ChangedBy { get; set; } = string.Empty;

        public string[] GetPermissionList() =>
            Permissions.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        public (bool Valid, string? Error) Validate()
        {
            foreach (var perm in GetPermissionList())
            {
                if (!ValidPermissionRegex.IsMatch(perm))
                    return (false, $"Invalid permission: '{perm}'. Only letters, digits, hyphens, underscores, colons, dots, curly braces, and asterisks are allowed.");
            }
            return (true, null);
        }

        private static readonly Regex ValidPermissionRegex = new(@"^[a-zA-Z0-9\-_:.{}*]+$", RegexOptions.Compiled);

        public void UpdateFromRequest(RoleRequest r, string changedByUserEmail)
        {
            Name = r.Name;
            HomePage = r.HomePage;
            Permissions = r.Permissions;
            ChangedBy = changedByUserEmail;
            ModifiedAt = DateTime.UtcNow;
        }
    }
}
