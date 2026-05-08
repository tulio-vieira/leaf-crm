using LogosAPI.Models;

namespace LogosAPI.Dtos;

public class CreateProviderRequest : UpdateProviderRequest
{
    public required string Slug { get; set; }
}

public class UpdateProviderRequest
{
    public required string Name { get; set; }
    public required string Description { get; set; }
}

public static class ProviderExtensions
{
    public static Provider MapFromRequest(this CreateProviderRequest r)
    {
        return new Provider
        {
            Name = r.Name,
            Description = r.Description,
            Slug = r.Slug,
        };
    }

    public static void UpdateFromRequest(this UpdateProviderRequest r, Provider provider)
    {
        provider.Name = r.Name;
        provider.Description = r.Description;
    }
}
