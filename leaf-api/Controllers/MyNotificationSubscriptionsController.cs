using LogosAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LogosAPI.Controllers;

[Authorize]
[Route("api/my/notification-subscriptions")]
[ApiController]
public class MyNotificationSubscriptionsController(DataContext context) : ControllerBase
{
    [HttpGet]
    public async Task<List<string>> GetMySubscriptions()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null) return [];

        return await context.ProviderNotificationSubscriptions
            .Where(s => s.UserEmail == email)
            .Select(s => s.ProviderSlug)
            .ToListAsync();
    }
}
