namespace WebAPI.Models;

public class Notification
{
    public int Id { get; set; }
    public required string Message { get; set; }
    public required string ProviderSlug { get; set; }
    public string? AcknowledgedByUserEmail { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
