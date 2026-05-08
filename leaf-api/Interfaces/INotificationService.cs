namespace LogosAPI.Interfaces
{
    public interface INotificationService
    {
        public Task NotifiyAccountCreated(string email, string token);
        public Task NotifyPasswordResetRequest(string email, string token);
        public Task SendMessage(string message);
        public Task NotifyProviderNotification(string email, string notificationMessage);
    }
}
