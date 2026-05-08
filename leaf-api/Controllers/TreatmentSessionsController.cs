using LogosAPI.Authorization;
using LogosAPI.Configuration;
using LogosAPI.Data;
using LogosAPI.Dtos;
using LogosAPI.Errors;
using LogosAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LogosAPI.Controllers;

[Authorize]
[Route("api/providers/{providerSlug}/patients/{patientId}/treatment-sessions")]
[ApiController]
public class TreatmentSessionsController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
{
    private readonly PaginationOptions _pagination = paginationOptions.Value;

    [HttpGet]
    [RequireProviderPermission(".treatment-sessions:read")]
    public async Task<PagedResponse<TreatmentSession>> GetSessions(
        string providerSlug,
        int patientId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 0)
    {
        if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
        if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
        if (page < 1) page = 1;

        var query = context.TreatmentSessions
            .Where(s => s.PatientId == patientId && s.ProviderSlug == providerSlug)
            .OrderByDescending(s => s.Start);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize + 1)
            .ToListAsync();

        var hasNextPage = items.Count > pageSize;
        if (hasNextPage) items.RemoveAt(items.Count - 1);

        return new PagedResponse<TreatmentSession>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            HasNextPage = hasNextPage
        };
    }

    [HttpGet("{id}")]
    [RequireProviderPermission(".treatment-sessions:read")]
    public async Task<TreatmentSession> GetSession(string providerSlug, int patientId, int id)
    {
        var session = await context.TreatmentSessions
            .Include(s => s.InsuranceAuthorization)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Agendamento não encontrado.");
        if (session.PatientId != patientId || session.ProviderSlug != providerSlug)
            throw new NotFoundException("Agendamento não encontrado.");
        return session;
    }

    [HttpPost]
    [RequireProviderPermission(".treatment-sessions:write")]
    public async Task<ActionResult<TreatmentSession>> CreateSession(string providerSlug, int patientId, TreatmentSessionRequest request)
    {
        var patientExists = await context.Patients.AnyAsync(p => p.Id == patientId && p.ProviderSlug == providerSlug);
        if (!patientExists)
            throw new NotFoundException("Paciente não encontrado.");

        var session = request.MapFromRequest(patientId, providerSlug);
        if (session.InsuranceAuthorizationId is not null)
        {
            session.InsuranceAuthorization = await context.InsuranceAuthorizations.FindAsync(request.InsuranceAuthorizationId)
                ?? throw new NotFoundException("Autorização de convênio não encontrada.");
            session.InsuranceAuthorization.IncrementAttachedSessions(context);
        }
        session.Validate();
        context.TreatmentSessions.Add(session);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(CreateSession), session);
    }

    [HttpPut("{id}")]
    [RequireProviderPermission(".treatment-sessions:write")]
    public async Task<TreatmentSession> UpdateSession(string providerSlug, int patientId, int id, TreatmentSessionRequest request)
    {
        var session = await context.TreatmentSessions
            .Include(t => t.InsuranceAuthorization)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new NotFoundException("Agendamento não encontrado.");

        if (session.PatientId != patientId || session.ProviderSlug != providerSlug)
            throw new NotFoundException("Agendamento não encontrado.");

        var oldInsuranceAuth = session.InsuranceAuthorization;
        request.UpdateFromRequest(session);

        if (oldInsuranceAuth?.Id != session.InsuranceAuthorizationId)
        {
            await session.PopulateInsuranceAuth(context);
            oldInsuranceAuth?.DecrementAttachedSessions(context);
            session.InsuranceAuthorization?.IncrementAttachedSessions(context);
        }

        session.Validate();
        context.Entry(session).State = EntityState.Modified;

        await context.SaveChangesAsync();
        return session;
    }

    [HttpDelete("{id}")]
    [RequireProviderPermission(".treatment-sessions:delete")]
    public async Task<IActionResult> DeleteSession(string providerSlug, int patientId, int id)
    {
        var session = await context.TreatmentSessions
            .Include(t => t.InsuranceAuthorization)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new NotFoundException("Agendamento não encontrado.");

        if (session.PatientId != patientId || session.ProviderSlug != providerSlug)
            throw new NotFoundException("Agendamento não encontrado.");

        session.InsuranceAuthorization?.DecrementAttachedSessions(context);

        context.TreatmentSessions.Remove(session);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
