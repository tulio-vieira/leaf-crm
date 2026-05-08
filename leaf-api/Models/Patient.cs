namespace WebAPI.Models;

public class Patient
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Shift { get; set; }
    public required string ProviderSlug { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //public Provider Provider { get; set; } = null!;
    //public List<InsuranceAuthorization> InsuranceAuthorizations { get; set; } = [];
    //public List<TreatmentSession> TreatmentSessions { get; set; } = [];
}
