using Hangfire;
using LogosAPI.Data;
using LogosAPI.Interfaces;
using LogosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LogosAPI.Jobs;

[DisableConcurrentExecution(timeoutInSeconds: 10 * 60)]
public class InsuranceAuthAboutToExpireJob(DataContext context, ILogger<InsuranceAuthAboutToExpireJob> logger, INotificationService notificationService)
{
    public async Task ExecuteAsync()
    {
        var now = DateTime.UtcNow;
        var sevenDaysFromNow = now.AddDays(7);

        var auths = await context.InsuranceAuthorizations
            .Where(a =>
                a.ExpiresAt < sevenDaysFromNow &&
                a.AboutToExpire == false)
            .ToListAsync();

        if (!auths.Any())
        {
            logger.LogInformation("InsuranceAuthAboutToExpireJob: no notifications to generate.");
            return;
        }

        foreach (var auth in auths)
            auth.AboutToExpire = true;

        await context.SaveChangesAsync();
        logger.LogInformation("InsuranceAuthAboutToExpireJob: processed {Count} authorizations.", auths.Count);
    }

    private List<Notification> CreateNotifications(IEnumerable<InsuranceAuthorization> auths)
    {
        var list = new List<Notification>();
        var groups = auths.GroupBy(a => a.ProviderSlug);
        foreach (var group in groups)
        {
            var providerSlug = group.Key;
            var lines = group.Select(a =>
                $"<li><a href='/providers/{providerSlug}/patients/{a.PatientId}/insurance-authorizations/{a.Id}'>{a.Name}</a></li>");

            var message = "As autorizações de convênio a seguir estão prestes a expirar em menos de uma semana:<br><ul>" + string.Join("\n", lines) + "</ul>";
            var notification = new Notification { ProviderSlug = providerSlug, Message = message };
            context.Notifications.Add(notification);
            list.Add(notification);
        }
        return list;
    }

    private async Task SendSubscriberNotifications(IEnumerable<Notification> notifications)
    {
        foreach (var notification in notifications)
        {
            var subs = await context.ProviderNotificationSubscriptions
                .Where(s => s.ProviderSlug == notification.ProviderSlug)
                .ToListAsync();

            foreach (var sub in subs)
                await notificationService.NotifyProviderNotification(sub.UserEmail, notification.Message);
        }
    }
}
