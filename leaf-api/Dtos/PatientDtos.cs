using System.ComponentModel.DataAnnotations;
using WebAPI.Models;

namespace WebAPI.Dtos;

public class PatientRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    [RegularExpression("^(morning|afternoon|night)$", ErrorMessage = "Turno deve ser 'morning', 'afternoon' ou 'night'.")]
    public string? Shift { get; set; }
}

public static class PatientExtensions
{
    public static Patient MapFromRequest(this PatientRequest r, string providerSlug)
    {
        return new Patient
        {
            Name = r.Name,
            Description = r.Description,
            Shift = r.Shift,
            ProviderSlug = providerSlug
        };
    }

    public static Patient UpdateFromRequest(this PatientRequest r, Patient p)
    {
        p.Name = r.Name;
        p.Description = r.Description;
        p.Shift = r.Shift;
        return p;
    }
}
