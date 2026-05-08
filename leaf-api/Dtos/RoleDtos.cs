using LogosAPI.Models;

namespace LogosAPI.Dtos
{
    public class RoleRequest
    {
        public required string Name { get; set; }
        public required string Permissions { get; set; }
        public string? HomePage { get; set; }



        public Role ToNewRole(string changedByUserEmail)
        {
            return new Role
            {
                Name = Name,
                Permissions = Permissions,
                HomePage = HomePage,
                ChangedBy = changedByUserEmail
            };
        }
    }
}
