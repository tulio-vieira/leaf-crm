using WebAPI.Interfaces;

namespace WebAPI.Services
{
    public class NotificationLoggerService(
        ILogger<NotificationLoggerService> logger,
        IConfiguration config
        ) : INotificationService
    {
        public Task NotifiyAccountCreated(string email, string token)
        {
            var frontEndUrl = config.GetValue<string>("FrontendUrl");
            var validateEmailUrl = $"{frontEndUrl}/auth/validate-email?token={token}";
            logger.LogInformation($"[email: {email}] New account created. Validate email at {validateEmailUrl}");
            return Task.CompletedTask;
        }

        public Task NotifyPasswordResetRequest(string email, string token)
        {
            var frontEndUrl = config.GetValue<string>("FrontendUrl");
            var resetPasswordUrl = $"{frontEndUrl}/auth/reset-password?token={token}&email={email}";
            logger.LogInformation($"[email: {email}] Reset Password at: {resetPasswordUrl}");
            return Task.CompletedTask;
        }

        public Task SendMessage(string message)
        {
            logger.LogInformation(message);
            return Task.CompletedTask;
        }

        public Task NotifyProviderNotification(string email, string notificationMessage)
        {
            logger.LogInformation("[email: {Email}] Provider notification: {Message}", email, notificationMessage);
            return Task.CompletedTask;
        }
    }
}
