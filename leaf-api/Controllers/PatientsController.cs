using WebAPI.Authorization;
using WebAPI.Configuration;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Errors;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace WebAPI.Controllers
{
    [Authorize]
    [Route("api/providers/{providerSlug}/patients")]
    [ApiController]
    public class PatientsController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet]
        [RequireProviderPermission(".patients:read")]
        public async Task<PagedResponse<Patient>> GetPatients(
            string providerSlug,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.Patients
                .Where(p => p.ProviderSlug == providerSlug)
                .OrderBy(p => p.Name);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            var hasNextPage = items.Count > pageSize;
            if (hasNextPage) items.RemoveAt(items.Count - 1);

            return new PagedResponse<Patient>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                HasNextPage = hasNextPage
            };
        }

        [HttpGet("{id}")]
        [RequireProviderPermission(".patients:read")]
        public async Task<Patient> GetPatient(string providerSlug, int id)
        {
            var patient = await context.Patients.FindAsync(id)
                ?? throw new NotFoundException("Paciente não encontrado.");
            if (patient.ProviderSlug != providerSlug)
                throw new NotFoundException("Paciente não encontrado.");
            return patient;
        }

        [HttpPost]
        [RequireProviderPermission(".patients:write")]
        public async Task<ActionResult<Patient>> CreatePatient(string providerSlug, PatientRequest request)
        {
            var providerExists = await context.Providers.AnyAsync(p => p.Slug == providerSlug);
            if (!providerExists)
                throw new NotFoundException("Clínica não encontrada.");
            var patient = request.MapFromRequest(providerSlug);
            context.Patients.Add(patient);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreatePatient), patient);
        }

        [HttpPut("{id}")]
        [RequireProviderPermission(".patients:write")]
        public async Task<Patient> UpdatePatient(string providerSlug, int id, PatientRequest request)
        {
            var patient = await context.Patients.FindAsync(id)
                ?? throw new NotFoundException("Paciente não encontrado.");
            if (patient.ProviderSlug != providerSlug)
                throw new NotFoundException("Paciente não encontrado.");
            request.UpdateFromRequest(patient);
            context.Entry(patient).State = EntityState.Modified;
            await context.SaveChangesAsync();
            return patient;
        }

        [HttpDelete("{id}")]
        [RequireProviderPermission(".patients:delete")]
        public async Task<IActionResult> DeletePatient(string providerSlug, int id)
        {
            var patient = await context.Patients.FindAsync(id)
                ?? throw new NotFoundException("Paciente não encontrado.");
            if (patient.ProviderSlug != providerSlug)
                throw new NotFoundException("Paciente não encontrado.");
            context.Patients.Remove(patient);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
