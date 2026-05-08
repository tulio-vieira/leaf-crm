namespace WebAPI.Models
{
    public class NotificationSubscription
    {
        public int Id { get; set; }
        public required string UserEmail { get; set; }
    }
}
