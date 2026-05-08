using LogosAPI.Authorization;
using LogosAPI.Configuration;
using LogosAPI.Data;
using LogosAPI.Dtos;
using LogosAPI.Errors;
using LogosAPI.Interfaces;
using LogosAPI.Models;
using LogosAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LogosAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(
        DataContext context,
        AuthService authService,
        INotificationService notificationService,
        IOptions<PaginationOptions> paginationOptions
        ) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet("profile")]
        public async Task<UserResponse> GetUserProfile()
        {
            var userId = authService.GetUserId(HttpContext);
            return await GetUser(userId);
        }

        [HttpGet("{userId}")]
        [RequirePermission("users:read")]
        public async Task<UserResponse> GetUser(Guid userId)
        {
            var user = await context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new NotFoundException($"Usuário com id {userId} não encontrado.");
            }
            return user.ToResponse();
        }

        [HttpGet]
        [RequirePermission("users:read")]
        public async Task<PagedResponse<UserResponse>> ListUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0,
            [FromQuery] int? roleId = null)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.Users
                .Include(u => u.Role)
                .Where(u => !roleId.HasValue || u.RoleId == roleId)
                .OrderBy(u => u.Name);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .Select(u => u.ToResponse())
                .ToListAsync();

            var hasNextPage = items.Count > pageSize;
            if (hasNextPage) items.RemoveAt(items.Count - 1);

            return new PagedResponse<UserResponse>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                HasNextPage = hasNextPage
            };
        }

        [HttpPost]
        [RequirePermission("users:write")]
        public async Task<ActionResult<Provider>> CreateUser(UserRequest request)
        {
            var roleExists = await context.Roles.AnyAsync(r => r.Id == request.RoleId);
            if (!roleExists)
                throw new NotFoundException("Cargo não encontrado.");
            var user = request.ToNewUser();
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreateUser), user);
        }

        [HttpPut("{userId}")]
        [RequirePermission("users:write")]
        public async Task<UserResponse> UpdateUser(Guid userId, UserRequest request)
        {
            var user = await context.Users.FindAsync(userId)
                ?? throw new NotFoundException("Usuário não encontrado.");
            if (request.RoleId != user.RoleId)
            {
                var roleExists = await context.Roles.AnyAsync(r => r.Id == request.RoleId);
                if (!roleExists)
                    throw new NotFoundException("Cargo não encontrado.");
            }
            user.UpdateFromRequest(request);
            await context.SaveChangesAsync();
            return user.ToResponse();
        }

        [HttpDelete("{userId}")]
        [RequirePermission("users:delete")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var user = await context.Users.FindAsync(userId)
                ?? throw new NotFoundException("Usuário não encontrado.");
            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{userId}/change-password")]
        [RequirePermission("users:write")]
        public async Task<IActionResult> ChangeUserPassword(Guid userId, ChangePasswordRequest request)
        {
            authService.ValidatePasswordFormat(request.NewPassword);
            var user = await context.Users.FindAsync(userId)
                ?? throw new NotFoundException("Usuário não encontrado.");
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, request.NewPassword);
            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{userId}/resend-password-reset")]
        [RequirePermission("users:write")]
        public async Task<IActionResult> ResendPasswordResetEmail(Guid userId)
        {
            var user = await context.Users.FindAsync(userId)
                ?? throw new NotFoundException("Usuário não encontrado.");
            var token = authService.CreateToken(user, AuthService.ResetPasswordRoute);
            await notificationService.NotifyPasswordResetRequest(user.Email, token);
            return NoContent();
        }

        [HttpPost("{userId}/resend-email-validation")]
        [RequirePermission("users:write")]
        public async Task<IActionResult> ResendEmailValidation(Guid userId)
        {
            var user = await context.Users.FindAsync(userId)
                ?? throw new NotFoundException("Usuário não encontrado.");
            if (user.IsEmailConfirmed)
                throw new ServiceException("O e-mail já foi confirmado.");
            var token = authService.CreateToken(user, AuthService.ValidateEmailRoute);
            await notificationService.NotifiyAccountCreated(user.Email, token);
            return NoContent();
        }
    }
}
