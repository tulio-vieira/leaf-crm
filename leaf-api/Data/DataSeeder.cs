using WebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Data;

public class DataSeeder(DataContext context)
{
    private static readonly Random Rng = new(42);

    public async Task SeedAsync()
    {
        if (await context.Providers.AnyAsync()) return;

        await CreateUsers();
        var insurances = CreateInsurances();
        context.Insurances.AddRange(insurances);
        await context.SaveChangesAsync();

        var providers = CreateProviders();
        context.Providers.AddRange(providers);
        await context.SaveChangesAsync();

        List<string> patientShifts = [
            "morning",
            "afternoon",
            "night"
        ];

        foreach (var (provider, patientNames) in providers.Zip(PatientNamesByProvider))
        {

            var patients = patientNames.Select(name => new Patient
            {
                Name = name,
                ProviderSlug = provider.Slug,
                Shift = patientShifts[Rng.Next(0, 3)],
            }).ToList();

            context.Patients.AddRange(patients);
            await context.SaveChangesAsync();

            foreach (var patient in patients)
            {
                var auths = CreateAuthorizations(patient);
                foreach (var auth in auths)
                {
                    auth.Validate();
                }
                context.InsuranceAuthorizations.AddRange(auths);
                await context.SaveChangesAsync();

                var sessions = CreateSessions(patient, auths);
                context.TreatmentSessions.AddRange(sessions);
                await context.SaveChangesAsync();
            }
        }
    }

    private static List<Insurance> CreateInsurances() =>
    [
        new() { Name = "Unimed",      Description = "Cooperativa médica líder no Brasil." },
        new() { Name = "Bradesco",    Description = "Plano de saúde Bradesco Seguros." },
        new() { Name = "SulAmérica",  Description = "Seguradora com ampla rede credenciada." },
        new() { Name = "Amil",        Description = "Plano Amil de assistência médica." },
    ];

    private static List<Provider> CreateProviders() =>
    [
        new() { Slug = "clinica-bem-estar",    Name = "Clínica Bem Estar",                      Description = "Atendimento completo em clínica geral e especialidades médicas." },
        new() { Slug = "centro-ortopedico",    Name = "Centro Ortopédico e Esportivo",          Description = "Ortopedia e reabilitação para atletas e pacientes em geral." },
        new() { Slug = "pediatria-familia",    Name = "Pediatria & Família",                    Description = "Cuidados pediátricos do recém-nascido à adolescência." },
        new() { Slug = "reabilita-saude",      Name = "Reabilita Saúde",                        Description = "Fisioterapia e terapia ocupacional." },
        new() { Slug = "clinica-mente-sana",   Name = "Clínica Mente Sana",                     Description = "Saúde mental e atendimento psiquiátrico." },
    ];

    private static readonly string[][] PatientNamesByProvider =
    [
        ["Carlos Mendes",    "Fernanda Lima",    "Rafael Souza",     "Juliana Costa",      "Bruno Alves"],
        ["Patrícia Rocha",   "Eduardo Ferreira", "Camila Oliveira",  "Rodrigo Martins",    "Letícia Nunes"],
        ["Anderson Pereira", "Mariana Gomes",    "Fábio Carvalho",   "Renata Ribeiro",     "Thiago Barbosa"],
        ["Luciana Cardoso",  "Marcelo Teixeira", "Aline Nascimento", "Felipe Santos",      "Débora Moraes"],
        ["Gustavo Pinto",    "Vanessa Correia",  "Igor Araújo",      "Simone Freitas",     "Paulo Henrique"],
    ];


    private static List<InsuranceAuthorization> CreateAuthorizations(Patient patient)
    {
        var baseDate = new DateTime(2026, 6, 3, 0, 0, 0, DateTimeKind.Utc);

        return [
            new()
            {
                Name = $"Autorização A - {patient.Name}",
                InsuranceName = "Unimed",
                PatientId = patient.Id,
                ProviderSlug = patient.ProviderSlug,
                AuthorizedSessionCount = 3,
                PaymentReceived = true,
                PriceCents = 18000,
                Description = "Autorização de convênio principal.",
                ExpiresAt = baseDate.AddDays(Rng.Next(0, 50)).AddHours(13),
            },
            new()
            {
                Name = $"Autorização B - {patient.Name}",
                InsuranceName = "Bradesco",
                PatientId = patient.Id,
                ProviderSlug = patient.ProviderSlug,
                AuthorizedSessionCount = 8,
                PaymentReceived = false,
                PriceCents = 25000,
                Description = "Autorização de convênio secundária.",
                ExpiresAt = baseDate.AddDays(Rng.Next(0, 50)).AddHours(13),
            },
        ];
    }

    private List<TreatmentSession> CreateSessions(Patient patient, List<InsuranceAuthorization> auths)
    {
        var sessions = new List<TreatmentSession>();
        int sessionCount = 6 + (patient.Id % 7);
        var baseDate = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc);
        int[] hours = [9, 10, 11, 13, 14, 15, 16];

        for (int i = 0; i < sessionCount; i++)
        {
            int dayOffset = Math.Min(i * 59 / sessionCount + Rng.Next(3), 58);
            var start = baseDate.AddDays(dayOffset).AddHours(hours[i % hours.Length]);
            var end = start.AddHours(1);

            // Attach ~2/3 of sessions to an insurance authorization; self-pay every 3rd session
            var targetAuth = i % 3 != 2 ? auths.FirstOrDefault(a => a.RemainingSessions > 0) : null;

            TreatmentSession session;
            if (targetAuth is not null)
            {
                session = new TreatmentSession
                {
                    Name = $"Agendamento {i + 1} - {patient.Name}",
                    PatientId = patient.Id,
                    ProviderSlug = patient.ProviderSlug,
                    InsuranceAuthorizationId = targetAuth.Id,
                    Description = "Agendamento coberto por autorização de convênio.",
                    PaymentReceived = false,
                    Start = start,
                    End = end,
                };
                targetAuth.IncrementAttachedSessions(context);
            }
            else
            {
                session = new TreatmentSession
                {
                    Name = $"Agendamento {i + 1} - {patient.Name}",
                    PatientId = patient.Id,
                    ProviderSlug = patient.ProviderSlug,
                    Description = "Agendamento com pagamento particular.",
                    PaymentReceived = Rng.Next(2) == 0,
                    PriceCents = 10000 + Rng.Next(16) * 1000,
                    Start = start,
                    End = end,
                };
            }

            sessions.Add(session);
        }

        return sessions;
    }

    private async Task CreateUsers()
    {
        var role = new Role
        {
            Name = "Admin",
            Permissions = "*",
        };
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = new User
        {
            Email = "admin@example.com",
            Name = "Admin",
            IsEmailConfirmed = true,
            // Admin1234
            PasswordHash = "AQAAAAIAAYagAAAAEPi7rAv21K75w0kXmhHeyPHIOYZgBKLeIfoZ5RiKcQP0EmxUPbtIQ3y/cdzpvgFpkg==",
            RoleId = role.Id,
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }
}
