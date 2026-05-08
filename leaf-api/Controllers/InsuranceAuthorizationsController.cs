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

namespace LogosAPI.Controllers
{
    [Authorize]
    [Route("api/providers/{providerSlug}/patients/{patientId}/insurance-authorizations")]
    [ApiController]
    public class InsuranceAuthorizationsController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet]
        [RequireProviderPermission(".insurance-authorization:read")]
        public async Task<PagedResponse<InsuranceAuthorization>> GetAuthorizations(
            string providerSlug,
            int patientId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.InsuranceAuthorizations
                .Where(a => a.PatientId == patientId && a.ProviderSlug == providerSlug)
                .OrderByDescending(a => a.CreatedAt);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            var hasNextPage = items.Count > pageSize;
            if (hasNextPage) items.RemoveAt(items.Count - 1);

            return new PagedResponse<InsuranceAuthorization>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                HasNextPage = hasNextPage
            };
        }

        [HttpGet("{id}")]
        [RequireProviderPermission(".insurance-authorization:read")]
        public async Task<InsuranceAuthorization> GetAuthorization(string providerSlug, int patientId, int id)
        {
            var authorization = await context.InsuranceAuthorizations
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new NotFoundException("Autorização de convênio não encontrada.");
            if (authorization.PatientId != patientId || authorization.ProviderSlug != providerSlug)
                throw new NotFoundException("Autorização de convênio não encontrada.");
            return authorization;
        }

        [HttpPost]
        [RequireProviderPermission(".insurance-authorization:write")]
        public async Task<ActionResult<InsuranceAuthorization>> CreateAuthorization(string providerSlug, int patientId, InsuranceAuthorizationRequest request)
        {
            var patientExists = await context.Patients.AnyAsync(p => p.Id == patientId && p.ProviderSlug == providerSlug);
            if (!patientExists)
                throw new NotFoundException("Paciente não encontrado.");

            var authorization = request.MapFromRequest(patientId, providerSlug);
            authorization.Validate();
            context.InsuranceAuthorizations.Add(authorization);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(CreateAuthorization), authorization);
        }

        [HttpPut("{id}")]
        [RequireProviderPermission(".insurance-authorization:write")]
        public async Task<InsuranceAuthorization> UpdateAuthorization(string providerSlug, int patientId, int id, InsuranceAuthorizationRequest request)
        {
            var authorization = await context.InsuranceAuthorizations.FindAsync(id)
                ?? throw new NotFoundException("Autorização de convênio não encontrada.");

            if (authorization.PatientId != patientId || authorization.ProviderSlug != providerSlug)
                throw new NotFoundException("Autorização de convênio não encontrada.");

            var snapshot = authorization.createSnapshot();
            context.InsuranceAuthorizationSnapshots.Add(snapshot);

            request.UpdateFromRequest(authorization);
            List<TreatmentSession> sessions = [];
            if (authorization.ExpiresAt != snapshot.ExpiresAt)
            {
                sessions = await context.TreatmentSessions.Where(t => t.InsuranceAuthorizationId == id).ToListAsync();
            }
            authorization.Validate(sessions);

            context.Entry(authorization).State = EntityState.Modified;
            await context.SaveChangesAsync();

            return authorization;
        }

        [HttpDelete("{id}")]
        [RequireProviderPermission(".insurance-authorization:delete")]
        public async Task<IActionResult> DeleteAuthorization(string providerSlug, int patientId, int id)
        {
            var authorization = await context.InsuranceAuthorizations.FindAsync(id)
                ?? throw new NotFoundException("Autorização de convênio não encontrada.");

            if (authorization.PatientId != patientId || authorization.ProviderSlug != providerSlug)
                throw new NotFoundException("Autorização de convênio não encontrada.");

            var hasSession = await context.TreatmentSessions.AnyAsync(s => s.InsuranceAuthorizationId == id);
            if (hasSession)
                throw new ServiceException("Existem agendamentos vinculados a esta autorização. Exclua os agendamentos primeiro.");

            context.InsuranceAuthorizations.Remove(authorization);
            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/history")]
        [RequireProviderPermission(".insurance-authorization:read")]
        public async Task<PagedResponse<InsuranceAuthorizationSnapshot>> GetHistory(
            string providerSlug,
            int patientId,
            int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var authorization = await context.InsuranceAuthorizations.FindAsync(id)
                ?? throw new NotFoundException("Autorização de convênio não encontrada.");
            if (authorization.PatientId != patientId || authorization.ProviderSlug != providerSlug)
                throw new NotFoundException("Autorização de convênio não encontrada.");

            var query = context.InsuranceAuthorizationSnapshots
                .Where(h => h.InsuranceAuthorizationId == id)
                .OrderByDescending(h => h.CreatedAt);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            var hasNextPage = items.Count > pageSize;
            if (hasNextPage) items.RemoveAt(items.Count - 1);

            return new PagedResponse<InsuranceAuthorizationSnapshot>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                HasNextPage = hasNextPage
            };
        }
    }
}
