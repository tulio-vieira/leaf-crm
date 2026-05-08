using WebAPI.Authorization;
using WebAPI.Data;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebAPI.Controllers;

[Authorize]
[Route("api/providers/{providerSlug}/notification-subscriptions")]
[ApiController]
public class NotificationSubscriptionsController(DataContext context) : ControllerBase
{
    [HttpPost]
    [RequireProviderPermission(".notifications:read")]
    public async Task<IActionResult> Subscribe(string providerSlug)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null) return Unauthorized();

        var exists = await context.NotificationSubscriptions
            .AnyAsync(s => s.UserEmail == email);

        if (exists) return Conflict();

        context.NotificationSubscriptions.Add(new NotificationSubscription
        {
            UserEmail = email,
        });

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete]
    [RequireProviderPermission(".notifications:read")]
    public async Task<IActionResult> Unsubscribe(string providerSlug)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null) return Unauthorized();

        var subscription = await context.NotificationSubscriptions
            .FirstOrDefaultAsync(s => s.UserEmail == email);

        if (subscription is not null)
        {
            context.NotificationSubscriptions.Remove(subscription);
            await context.SaveChangesAsync();
        }

        return NoContent();
    }
}
