using WebAPI.Authorization;
using WebAPI.Configuration;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace WebAPI.Controllers;

[Authorize]
[Route("api/list")]
[ApiController]
public class ListController(DataContext context, IOptions<PaginationOptions> paginationOptions) : ControllerBase
{
    private readonly PaginationOptions _pagination = paginationOptions.Value;

    [HttpGet("notifications")]
    [RequireProviderPermission(".notifications:read")]
    public async Task<PagedResponse<Notification>> ListNotifications(
        [FromQuery] bool? acknowledged = null,
        [FromQuery] DateTime? createdat_gt = null,
        [FromQuery] DateTime? createdat_lt = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 0)
    {
        if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
        if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
        if (page < 1) page = 1;

        var query = context.Notifications.AsQueryable();
        if (acknowledged == true)
            query = query.Where(n => n.AcknowledgedByUserEmail != null);
        else if (acknowledged == false)
            query = query.Where(n => n.AcknowledgedByUserEmail == null);
        if (createdat_gt is not null)
            query = query.Where(n => n.CreatedAt > createdat_gt);
        if (createdat_lt is not null)
            query = query.Where(n => n.CreatedAt < createdat_lt);
        query = query.OrderByDescending(n => n.CreatedAt);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize + 1)
            .ToListAsync();

        var hasNextPage = items.Count > pageSize;
        if (hasNextPage) items.RemoveAt(items.Count - 1);

        return new PagedResponse<Notification>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            HasNextPage = hasNextPage
        };
    }
}
