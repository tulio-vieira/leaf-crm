using WebAPI.Models;

namespace WebAPI.Dtos;

public class InsuranceAuthorizationRequest
{
    public required string Name { get; set; }
    public required string InsuranceName { get; set; }
    public required int AuthorizedSessionCount { get; set; }
    public required bool PaymentReceived { get; set; }
    public required int PriceCents { get; set; }
    public required string Description { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public bool MonitorExpired { get; set; } = true;
    public bool MonitorAboutToExpire { get; set; } = true;
    public bool MonitorAboutToBeFull { get; set; } = true;
}

public static class InsuranceAuthorizationExtensions
{
    public static InsuranceAuthorization MapFromRequest(this InsuranceAuthorizationRequest r, int patientId, string providerSlug)
    {
        return new InsuranceAuthorization
        {
            Name = r.Name,
            InsuranceName = r.InsuranceName,
            PatientId = patientId,
            ProviderSlug = providerSlug,
            AuthorizedSessionCount = r.AuthorizedSessionCount,
            PaymentReceived = r.PaymentReceived,
            Description = r.Description,
            PriceCents = r.PriceCents,
            ExpiresAt = r.ExpiresAt,
            MonitorExpired = r.MonitorExpired,
            MonitorAboutToExpire = r.MonitorAboutToExpire,
            MonitorAboutToBeFull = r.MonitorAboutToBeFull,
        };
    }

    public static void UpdateFromRequest(this InsuranceAuthorizationRequest r, InsuranceAuthorization authorization)
    {
        authorization.Name = r.Name;
        authorization.InsuranceName = r.InsuranceName;
        authorization.AuthorizedSessionCount = r.AuthorizedSessionCount;
        authorization.Description = r.Description;
        authorization.ExpiresAt = r.ExpiresAt;
        authorization.PaymentReceived = r.PaymentReceived;
        authorization.PriceCents = r.PriceCents;
        authorization.MonitorExpired = r.MonitorExpired;
        authorization.MonitorAboutToExpire = r.MonitorAboutToExpire;
        authorization.MonitorAboutToBeFull = r.MonitorAboutToBeFull;
    }
}
