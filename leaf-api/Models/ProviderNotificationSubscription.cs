namespace LogosAPI.Models
{
    public class ProviderNotificationSubscription
    {
        public int Id { get; set; }
        public required string UserEmail { get; set; }
        public required string ProviderSlug { get; set; }
    }
}
