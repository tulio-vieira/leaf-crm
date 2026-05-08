using LogosAPI.Authorization;
using LogosAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LogosAPI.Controllers;

[Authorize]
[Route("api/providers/{providerSlug}/notifications")]
[ApiController]
public class NotificationsController(DataContext context) : ControllerBase
{
    [HttpDelete("{id}")]
    [RequireProviderPermission(".notifications:delete")]
    public async Task<IActionResult> DeleteNotification(string providerSlug, int id)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.ProviderSlug == providerSlug);

        if (notification is null) return NotFound();

        context.Notifications.Remove(notification);
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/acknowledge")]
    [RequireProviderPermission(".notifications:write")]
    public async Task<IActionResult> AcknowledgeNotification(string providerSlug, int id)
    {
        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.ProviderSlug == providerSlug);

        if (notification is null) return NotFound();

        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (userEmail is null)
            return Unauthorized();

        notification.AcknowledgedByUserEmail = userEmail;
        await context.SaveChangesAsync();
        return NoContent();
    }
}
