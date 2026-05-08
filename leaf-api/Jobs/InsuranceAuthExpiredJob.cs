using Hangfire;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Jobs;

[DisableConcurrentExecution(timeoutInSeconds: 10 * 60)]
public class InsuranceAuthExpiredJob(DataContext context, ILogger<InsuranceAuthExpiredJob> logger, INotificationService notificationService)
{
    public async Task ExecuteAsync()
    {
        var now = DateTime.UtcNow;

        var auths = await context.InsuranceAuthorizations
            .Where(a =>
                a.ExpiresAt < now &&
                a.Expired == false)
            .ToListAsync();

        if (!auths.Any())
        {
            logger.LogInformation("InsuranceAuthExpiredJob: no authorizations have expired.");
            return;
        }

        foreach (var auth in auths)
            auth.Expired = true;

        await context.SaveChangesAsync();
        logger.LogInformation("InsuranceAuthExpiredJob: processed {Count} authorizations.", auths.Count);
    }

    private List<Notification> CreateNotifications(IEnumerable<InsuranceAuthorization> auths)
    {
        var list = new List<Notification>();
        var groups = auths.GroupBy(a => a.ProviderSlug);
        foreach (var group in groups)
        {
            var providerSlug = group.Key;
            var lines = group
                .Where(a => a.RemainingSessions > 0)
                .Select(a => $"<li><a href='/providers/{providerSlug}/patients/{a.PatientId}/insurance-authorizations/{a.Id}'>{a.Name}</a></li>")
                .ToList();

            if (lines.Count == 0) continue;

            var message = "As seguintes autorizações de convênio expiraram:<br><ul>" + string.Join("\n", lines) + "</ul>";
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
