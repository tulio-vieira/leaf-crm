using LogosAPI.Data;
using LogosAPI.Errors;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace LogosAPI.Models;

public class InsuranceAuthorization
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string InsuranceName { get; set; }
    public required int PatientId { get; set; }
    public required string ProviderSlug { get; set; }

    [Range(1, int.MaxValue)]
    public required int AuthorizedSessionCount { get; set; }

    [Range(0, int.MaxValue)]
    public int AttachedSessionCount { get; set; } = 0;
    public int RemainingSessions { get; set; } = 0;
    public required bool PaymentReceived { get; set; }
    public required int PriceCents { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required DateTime ExpiresAt { get; set; }
    public Patient? Patient { get; set; } = null!;

    //public List<TreatmentSession> TreatmentSesssions { get; set; } = [];
    //public List<InsuranceAuthorizationSnapshot> Snapshots { get; set; } = [];

    public bool Expired { get; set; } = false;
    public bool AboutToExpire { get; set; } = false;
    public bool AboutToBeFull { get; set; } = false;
    public bool MonitorExpired { get; set; } = true;
    public bool MonitorAboutToExpire { get; set; } = true;
    public bool MonitorAboutToBeFull { get; set; } = true;


    public InsuranceAuthorizationSnapshot createSnapshot()
    {
        return new InsuranceAuthorizationSnapshot
        {
            Name = Name,
            InsuranceName = InsuranceName,
            AuthorizedSessionCount = AuthorizedSessionCount,
            Description = Description,
            ExpiresAt = ExpiresAt,
            PaymentReceived = PaymentReceived,
            PriceCents = PriceCents,
            InsuranceAuthorizationId = Id
        };
    }

    public void Validate(List<TreatmentSession>? sessions = null)
    {
        if (AuthorizedSessionCount < AttachedSessionCount)
        {
            throw new ServiceException("Autorização de convênio já está cheia.");
        }
        
        RemainingSessions = AuthorizedSessionCount - AttachedSessionCount;

        if (sessions is not null)
        {
            foreach (var session in sessions)
            {
                if (session.Start > ExpiresAt)
                {
                    throw new ServiceException($"A data de expiração não pode ser anterior à data de início do agendamento '{session.Name}'.");
                }
            }
        }
        var now = DateTime.UtcNow;

        CheckExpired(now);
        CheckAboutToExpire(now);
        CheckAboutToBeFull(now);
    }

    public void IncrementAttachedSessions(DataContext context)
    {
        AttachedSessionCount++;
        Validate();
        context.Entry(this).State = EntityState.Modified;
    }

    public void DecrementAttachedSessions(DataContext context)
    {
        AttachedSessionCount--;
        Validate();
        context.Entry(this).State = EntityState.Modified;
    }

    private void CheckExpired(DateTime now)
    {
        if (MonitorExpired)
            Expired = now > ExpiresAt;
        else
            Expired = false;
    }

    private void CheckAboutToExpire(DateTime now)
    {
        if (MonitorAboutToExpire)
            AboutToExpire = ExpiresAt < now.AddDays(7);
        else
            AboutToExpire = false;
    }

    private void CheckAboutToBeFull(DateTime now)
    {
        if (MonitorAboutToBeFull)
            AboutToBeFull = RemainingSessions < 5;
        else
            AboutToBeFull = false;
    }
}
