using WebAPI.Authorization;
using WebAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebAPI.Controllers;

[Authorize]
[Route("api/notifications")]
[ApiController]
public class NotificationsController(DataContext context) : ControllerBase
{
    [HttpDelete("{id}")]
    [RequirePermission("notifications:delete")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id);

        if (notification is null) return NotFound();

        context.Notifications.Remove(notification);
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/acknowledge")]
    [RequirePermission("notifications:write")]
    public async Task<IActionResult> AcknowledgeNotification(int id)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id);

        if (notification is null) return NotFound();

        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (userEmail is null)
            return Unauthorized();

        notification.AcknowledgedByUserEmail = userEmail;
        await context.SaveChangesAsync();
        return NoContent();
    }
}
