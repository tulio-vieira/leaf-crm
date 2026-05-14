using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using WebAPI.Authorization;
using WebAPI.Configuration;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Errors;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Authorize]
    [Route("api/leads")]
    [ApiController]
    public class LeadsController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet]
        [RequirePermission("leads:read")]
        public async Task<PagedResponse<Lead>> ListLeads(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0,
            [FromQuery] int? boardId = null,
            [FromQuery] int? columnIdx = null,
            [FromQuery] string? afterPosition = null)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.Leads.AsQueryable();

            if (boardId.HasValue)
                query = query.Where(l => l.BoardId == boardId.Value);

            if (columnIdx.HasValue)
                query = query.Where(l => l.ColumnIdx == columnIdx.Value);

            // Position DESC, NULLs last, then Id DESC as tiebreaker
            query = query
                .OrderBy(l => l.Position == null ? 1 : 0)
                .ThenByDescending(l => l.Position)
                .ThenByDescending(l => l.Id);

            if (afterPosition != null)
            {
                var cursor = afterPosition;
                query = query.Where(l => l.Position == null || string.Compare(l.Position, cursor) < 0);

                var cursorItems = await query.Take(pageSize + 1).ToListAsync();
                return new PagedResponse<Lead>
                {
                    Items = cursorItems.Take(pageSize).ToList(),
                    Page = 1,
                    PageSize = pageSize,
                    HasNextPage = cursorItems.Count > pageSize
                };
            }

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            return new PagedResponse<Lead>
            {
                Items = items.Take(pageSize).ToList(),
                Page = page,
                PageSize = pageSize,
                HasNextPage = items.Count > pageSize
            };
        }

        [HttpGet("{id}")]
        [RequirePermission("leads:read")]
        public async Task<Lead> GetLead(int id)
        {
            return await context.Leads.Include(l => l.Board).FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new NotFoundException("Lead não encontrado.");
        }

        [HttpPost]
        [RequirePermission("leads:write")]
        public async Task<ActionResult<Lead>> CreateLead(LeadRequest request)
        {
            var board = await context.Boards.FindAsync(request.BoardId)
                ?? throw new NotFoundException("Quadro não encontrado.");

            var lead = request.ToEntity(GetCurrentUserEmail());
            lead.Validate(board);

            context.Leads.Add(lead);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, lead);
        }

        [HttpPut("{id}")]
        [RequirePermission("leads:write")]
        public async Task<Lead> UpdateLead(int id, LeadRequest request)
        {
            var lead = await context.Leads.FindAsync(id)
                ?? throw new NotFoundException("Lead não encontrado.");

            var board = await context.Boards.FindAsync(request.BoardId)
                ?? throw new NotFoundException("Quadro não encontrado.");

            lead.UpdateFromRequest(request, GetCurrentUserEmail());
            lead.Validate(board);

            context.Entry(lead).State = EntityState.Modified;
            await context.SaveChangesAsync();
            return lead;
        }

        [HttpDelete("{id}")]
        [RequirePermission("leads:delete")]
        public async Task<IActionResult> DeleteLead(int id)
        {
            var lead = await context.Leads.FindAsync(id)
                ?? throw new NotFoundException("Lead não encontrado.");

            context.Leads.Remove(lead);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private string GetCurrentUserEmail()
        {
            return HttpContext.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? string.Empty;
        }
    }
}
