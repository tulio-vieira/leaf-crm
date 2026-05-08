using LogosAPI.Authorization;
using LogosAPI.Data;
using LogosAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LogosAPI.Controllers;

[Authorize]
[Route("api/providers/{providerSlug}/notification-subscriptions")]
[ApiController]
public class ProviderNotificationSubscriptionsController(DataContext context) : ControllerBase
{
    [HttpPost]
    [RequireProviderPermission(".notifications:read")]
    public async Task<IActionResult> Subscribe(string providerSlug)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null) return Unauthorized();

        var exists = await context.ProviderNotificationSubscriptions
            .AnyAsync(s => s.UserEmail == email && s.ProviderSlug == providerSlug);

        if (exists) return Conflict();

        context.ProviderNotificationSubscriptions.Add(new ProviderNotificationSubscription
        {
            UserEmail = email,
            ProviderSlug = providerSlug
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

        var subscription = await context.ProviderNotificationSubscriptions
            .FirstOrDefaultAsync(s => s.UserEmail == email && s.ProviderSlug == providerSlug);

        if (subscription is not null)
        {
            context.ProviderNotificationSubscriptions.Remove(subscription);
            await context.SaveChangesAsync();
        }

        return NoContent();
    }
}
