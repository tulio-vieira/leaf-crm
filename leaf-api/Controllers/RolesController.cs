using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebAPI.Authorization;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Errors;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Authorize]
    [Route("api/roles")]
    [ApiController]
    public class RolesController(DataContext context) : ControllerBase
    {
        [HttpGet]
        [RequirePermission("roles:read")]
        public async Task<List<Role>> ListRoles()
        {
            return await context.Roles
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [RequirePermission("roles:read")]
        public async Task<Role> GetRole(int id)
        {
            return await context.Roles.FindAsync(id)
                ?? throw new NotFoundException("Cargo não encontrado.");
        }

        [HttpPost]
        [RequirePermission("roles:write")]
        public async Task<ActionResult<Role>> CreateRole(RoleRequest request)
        {
            var role = request.ToNewRole(GetCurrentUserEmail());
            var (valid, error) = role.Validate();
            if (!valid)
                throw new ServiceException(error!);

            context.Roles.Add(role);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        [RequirePermission("roles:write")]
        public async Task<Role> UpdateRole(int id, RoleRequest request)
        {
            var role = await context.Roles.FindAsync(id)
                ?? throw new NotFoundException("Cargo não encontrado.");

            role.UpdateFromRequest(request, GetCurrentUserEmail());

            var (valid, error) = role.Validate();
            if (!valid)
                throw new ServiceException(error!);

            context.Entry(role).State = EntityState.Modified;
            await context.SaveChangesAsync();

            return role;
        }

        [HttpDelete("{id}")]
        [RequirePermission("roles:delete")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await context.Roles.FindAsync(id)
                ?? throw new NotFoundException("Cargo não encontrado.");

            context.Roles.Remove(role);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private string GetCurrentUserEmail()
        {
            return HttpContext.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? string.Empty;
        }
    }
}
