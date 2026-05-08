using LogosAPI.Data;
using LogosAPI.Errors;

namespace LogosAPI.Models;

public class TreatmentSession
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int PatientId { get; set; }
    public required string ProviderSlug { get; set; }
    public int? InsuranceAuthorizationId { get; set; }
    public string? Description { get; set; }
    public bool PaymentReceived { get; set; } = false;
    public int? PriceCents { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Patient Patient { get; set; } = null!;
    public InsuranceAuthorization? InsuranceAuthorization { get; set; } = null;
    //public List<TreatmentSessionSnapshot> Snapshots { get; set; } = [];


    //public TreatmentSessionSnapshot createSnapshot()
    //{
    //    return new TreatmentSessionSnapshot
    //    {
    //        Name = Name,
    //        Description = Description,
    //        PaymentReceived = PaymentReceived,
    //        PriceCents = PriceCents,
    //        InsuranceAuthorizationId = Id,
    //        Start = Start,
    //        End = End,
    //    };
    //}

    public void Validate()
    {
        // treatmentsession should either cost something or be attached to insuranceauth
        if (PriceCents != null && InsuranceAuthorizationId != null
            || PriceCents == null && InsuranceAuthorizationId == null)
            throw new ServiceException("O agendamento deve ter um preço ou estar vinculado a uma autorização de convênio.");

        // check if start and end dates are valid
        if (Start > End)
            throw new ServiceException("A data de início não pode ser posterior à data de fim.");

        // validate positive price if it is paid
        if (PriceCents != null)
        {
            if (PriceCents < 0) throw new ServiceException("O preço deve ser maior ou igual a zero.");
            return;
        }

        if (PaymentReceived)
            throw new ServiceException("Agendamento vinculado a uma autorização de convênio não deve possuir pagamentos.");

        if (InsuranceAuthorization == null)
            throw new NotFoundException("Autorização de convênio não encontrada.");

        // treatment session should be attached to insuranceauth that belongs to patient
        if (InsuranceAuthorization.PatientId != PatientId)
            throw new ServiceException("O agendamento deve estar vinculado a uma autorização de convênio do mesmo paciente.");

        // expiry date should be respected
        if (Start > InsuranceAuthorization.ExpiresAt)
            throw new ServiceException("A data de início é posterior à data de expiração da autorização de convênio.");
    }

    public async Task PopulateInsuranceAuth(DataContext context)
    {
        if (InsuranceAuthorizationId == null)
        {
            InsuranceAuthorization = null;
            return;
        }
        InsuranceAuthorization = await context.InsuranceAuthorizations.FindAsync(InsuranceAuthorizationId) ??
            throw new NotFoundException("Autorização de convênio não encontrada.");
    }
}
