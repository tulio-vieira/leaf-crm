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
using System.Management.Automation;

namespace LogosAPI.Controllers
{
    [Authorize]
    [Route("api/providers")]
    [ApiController]
    public class ProvidersController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet]
        [RequireProviderPermission(":read")]
        public async Task<PagedResponse<Provider>> GetProviders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.Providers.OrderBy(p => p.Name);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            var hasNextPage = items.Count > pageSize;
            if (hasNextPage) items.RemoveAt(items.Count - 1);

            return new PagedResponse<Provider>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                HasNextPage = hasNextPage
            };
        }


        [HttpGet("allowedList")]
        public async Task<List<Provider>> GetAllowedProviders()
        {
            var list = await context.Providers.OrderBy(p => p.Name)
                .ToListAsync();
            return list.FindAll(p => CheckPermission(p.Slug));
        }


        [HttpGet("{providerSlug}")]
        [RequireProviderPermission(":read")]
        public async Task<Provider> GetProvider(string providerSlug)
        {
            return await context.Providers.FindAsync(providerSlug)
                ?? throw new NotFoundException("Clínica não encontrada.");
        }

        [HttpPost]
        [RequirePermission("providers:write")]
        public async Task<ActionResult<Provider>> CreateProvider(CreateProviderRequest request)
        {
            var provider = request.MapFromRequest();
            context.Providers.Add(provider);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreateProvider), provider);
        }

        [HttpPut("{providerSlug}")]
        [RequireProviderPermission(":write")]
        public async Task<Provider> UpdateProvider(string providerSlug, UpdateProviderRequest request)
        {
            var provider = await context.Providers.FindAsync(providerSlug)
                ?? throw new NotFoundException("Clínica não encontrada.");
            request.UpdateFromRequest(provider);
            context.Entry(provider).State = EntityState.Modified;
            await context.SaveChangesAsync();
            return provider;
        }

        [HttpDelete("{providerSlug}")]
        [RequirePermission("providers:delete")]
        public async Task<IActionResult> DeleteProvider(string providerSlug)
        {
            var provider = await context.Providers.FindAsync(providerSlug)
                ?? throw new NotFoundException("Clínica não encontrada.");
            context.Providers.Remove(provider);
            await context.SaveChangesAsync();
            return NoContent();
        }


        private bool CheckPermission(string providerSlug)
        {
            var user = HttpContext.User;
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedException();

            var userPermissions = user.Claims
                .Where(c => c.Type == "permission")
                .Select(c => c.Value);

            var permission = $"providers{{{providerSlug}}}:read";
            foreach (var perm in userPermissions)
            {
                var pattern = new WildcardPattern(perm, WildcardOptions.IgnoreCase);
                if (pattern.IsMatch(permission))
                {
                    return true;
                }
            }

            return false;
        }
    }
}
