namespace LogosAPI.Models;

public class Provider
{
    public required string Slug { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //public List<Patient> Patients { get; set; } = [];
}
