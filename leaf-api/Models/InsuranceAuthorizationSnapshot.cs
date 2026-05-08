using LogosAPI.Dtos;

namespace LogosAPI.Models;

public class InsuranceAuthorizationSnapshot: InsuranceAuthorizationRequest
{
    public int Id { get; set; }
    public int InsuranceAuthorizationId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // public int ChangedByUserId { get; set; }

    //public InsuranceAuthorization InsuranceAuthorization { get; set; } = null!;
}
