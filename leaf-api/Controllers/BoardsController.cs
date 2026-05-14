using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WebAPI.Authorization;
using WebAPI.Configuration;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Errors;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Authorize]
    [Route("api/boards")]
    [ApiController]
    public class BoardsController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet]
        [RequirePermission("boards:read")]
        public async Task<PagedResponse<Board>> ListBoards(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.Boards.OrderBy(b => b.Name);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            return new PagedResponse<Board>
            {
                Items = items.Take(pageSize).ToList(),
                Page = page,
                PageSize = pageSize,
                HasNextPage = items.Count > pageSize
            };
        }

        [HttpGet("{id}")]
        [RequirePermission("boards:read")]
        public async Task<BoardDetailResponse> GetBoard(int id)
        {
            var board = await context.Boards.FindAsync(id)
                ?? throw new NotFoundException("Quadro não encontrado.");

            var grouped = await context.Leads
                .Where(l => l.BoardId == id)
                .GroupBy(l => l.ColumnIdx)
                .Select(g => new { ColumnIdx = g.Key, Count = g.Count() })
                .ToListAsync();

            var counts = new int[board.Columns.Count];
            foreach (var g in grouped)
                if (g.ColumnIdx >= 0 && g.ColumnIdx < counts.Length)
                    counts[g.ColumnIdx] = g.Count;

            return new BoardDetailResponse { Board = board, ColumnCounts = counts.ToList() };
        }

        [HttpPost]
        [RequirePermission("boards:write")]
        public async Task<ActionResult<Board>> CreateBoard(BoardCreateRequest request)
        {
            var board = request.ToEntity();
            board.Validate();
            context.Boards.Add(board);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, board);
        }

        [HttpPut("{id}")]
        [RequirePermission("boards:write")]
        public async Task<Board> UpdateBoard(int id, BoardUpdateRequest request)
        {
            var board = await context.Boards.FindAsync(id)
                ?? throw new NotFoundException("Quadro não encontrado.");

            board.UpdateFromRequest(request);
            board.Validate();

            context.Entry(board).State = EntityState.Modified;
            await context.SaveChangesAsync();
            return board;
        }

        [HttpDelete("{id}")]
        [RequirePermission("boards:delete")]
        public async Task<IActionResult> DeleteBoard(int id)
        {
            var board = await context.Boards.FindAsync(id)
                ?? throw new NotFoundException("Quadro não encontrado.");

            context.Boards.Remove(board);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
