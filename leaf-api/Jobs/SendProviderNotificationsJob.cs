using Hangfire;
using LogosAPI.Data;
using LogosAPI.Interfaces;
using LogosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LogosAPI.Jobs;

[DisableConcurrentExecution(timeoutInSeconds: 10 * 60)]
public class SendProviderNotificationsJob(
    DataContext context,
    ILogger<SendProviderNotificationsJob> logger,
    INotificationService notificationService,
    IConfiguration config)
    {
    private string FrontendUrl => config.GetValue<string>("FrontendUrl");
    
    public async Task ExecuteAsync()
    {

        var expiredAuths = await context.InsuranceAuthorizations
             .Where(a => a.Expired)
             .ToListAsync();

        var aboutToExpireAuth = await context.InsuranceAuthorizations
             .Where(a => a.AboutToExpire)
             .ToListAsync();

        var aboutToBeFullAuths = await context.InsuranceAuthorizations
             .Where(a => a.AboutToBeFull)
             .ToListAsync();

        var providerDict = new Dictionary<string, List<Notification>>();

        logger.LogInformation("Expired Insurance Auths count: " + expiredAuths.Count());
        logger.LogInformation("About to expire Insurance Auths count: " + aboutToExpireAuth.Count());
        logger.LogInformation("About to be full Auths count: " + aboutToBeFullAuths.Count());

        CreateNotifications(expiredAuths, providerDict, "As seguintes autorizações de convênio expiraram:");
        CreateNotifications(aboutToExpireAuth, providerDict, "As seguintes autorizações de convênio estão prestes a expirar:");
        CreateNotifications(aboutToBeFullAuths, providerDict, "As seguintes autorizações de convênio estão quase cheias:");

        await context.SaveChangesAsync();

        logger.LogInformation("Sending Provider notifications...");
        await SendSubscriberNotifications(providerDict);
    }

    private void CreateNotifications(
        IEnumerable<InsuranceAuthorization> auths,
        Dictionary<string, List<Notification>> providerDict,
        string messagePrefix
        )
    {
        if (!auths.Any()) return;
        var groups = auths.GroupBy(a => a.ProviderSlug);
        foreach (var group in groups)
        {
            var providerSlug = group.Key;
            var lines = group.Select(a =>
                $"<li><a target='_blank' href='{FrontendUrl}/providers/{providerSlug}/patients/{a.PatientId}/insurance-authorizations/{a.Id}'>{a.Name}</a></li>");

            var message = messagePrefix + "<br><ul>" + string.Join("\n", lines) + "</ul>";
            var notification = new Notification { ProviderSlug = providerSlug, Message = message };
            if (!providerDict.TryGetValue(providerSlug, out _))
            {
                providerDict[providerSlug] = new List<Notification>();
            }
            providerDict[providerSlug].Add(notification);
            context.Notifications.Add(notification);
        }
    }

    private async Task SendSubscriberNotifications(Dictionary<string, List<Notification>> providerDict)
    {
        foreach (var (slug, notifications) in providerDict)
        {
            var mergedMsg = "";
            foreach (var notification in notifications)
            {
                mergedMsg += notification.Message + "<br><br>";
            }
            var subs = await context.ProviderNotificationSubscriptions
                .Where(s => s.ProviderSlug == slug)
                .ToListAsync();

            foreach (var sub in subs)
                await notificationService.NotifyProviderNotification(sub.UserEmail, mergedMsg);
        }
    }
}
