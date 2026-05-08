using LogosAPI.Models;

namespace LogosAPI.Dtos;

public class InsuranceRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
}

public static class InsuranceExtensions
{
    public static Insurance MapFromRequest(this InsuranceRequest r)
    {
        return new Insurance
        {
            Name = r.Name,
            Description = r.Description,
        };
    }

    public static void UpdateFromRequest(this InsuranceRequest r, Insurance insurance)
    {
        insurance.Name = r.Name;
        insurance.Description = r.Description;
    }
}
