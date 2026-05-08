using WebAPI.Models;

namespace WebAPI.Dtos;

public class TreatmentSessionRequest
{
    public required string Name { get; set; }
    public int? InsuranceAuthorizationId { get; set; }
    public string? Description { get; set; }
    public required bool PaymentReceived { get; set; }
    public int? PriceCents { get; set; }
    public required DateTime Start { get; set; }
    public required DateTime End { get; set; }
}

public static class TreatmentSessionExtensions
{
    public static TreatmentSession MapFromRequest(this TreatmentSessionRequest r, int patientId, string providerSlug)
    {
        return new TreatmentSession
        {
            Name = r.Name,
            PatientId = patientId,
            ProviderSlug = providerSlug,
            InsuranceAuthorizationId = r.InsuranceAuthorizationId,
            Description = r.Description,
            PaymentReceived = r.PaymentReceived,
            PriceCents = r.PriceCents,
            Start = r.Start,
            End = r.End
        };
    }

    public static TreatmentSession UpdateFromRequest(this TreatmentSessionRequest r, TreatmentSession session)
    {
        session.Name = r.Name;
        session.InsuranceAuthorizationId = r.InsuranceAuthorizationId;
        session.Description = r.Description;
        session.PaymentReceived = r.PaymentReceived;
        session.PriceCents = r.PriceCents;
        session.Start = r.Start;
        session.End = r.End;
        return session;
    }
}
