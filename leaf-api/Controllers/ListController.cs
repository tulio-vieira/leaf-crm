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

    [HttpGet("patients")]
    [RequireProviderPermission(".patients:read")]
    public async Task<PagedResponse<Patient>> ListPatients(
        [FromQuery] string? providerSlug = null,
        [FromQuery] string? name = null,
        [FromQuery] string? shift = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 0)
    {
        if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
        if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
        if (page < 1) page = 1;

        var query = context.Patients.AsQueryable();
        if (providerSlug is not null)
            query = query.Where(p => p.ProviderSlug == providerSlug);
        if (!string.IsNullOrEmpty(name))
            query = query.Where(p => p.Name.ToLower().Contains(name.ToLower()));
        if (shift is not null)
            query = query.Where(p => p.Shift == shift);
        query = query.OrderBy(p => p.Name);

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

    [HttpGet("insurance-authorizations")]
    [RequireProviderPermission(".insurance-authorizations:read")]
    public async Task<PagedResponse<InsuranceAuthorization>> ListInsuranceAuthorizations(
        [FromQuery] string? providerSlug = null,
        [FromQuery] int? patientId = null,
        [FromQuery] string? insuranceName = null,
        [FromQuery] DateTime? expiresat_gt = null,
        [FromQuery] DateTime? expiresat_lt = null,
        [FromQuery] int? remainingsessions_gt = null,
        [FromQuery] int? remainingsessions_lt = null,
        [FromQuery] bool? expired = null,
        [FromQuery] bool? aboutToExpire = null,
        [FromQuery] bool? aboutToBeFull = null,
        [FromQuery] string? orderby = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 0)
    {
        if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
        if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
        if (page < 1) page = 1;

        var query = context.InsuranceAuthorizations.AsQueryable();
        if (providerSlug is not null)
            query = query.Where(a => a.ProviderSlug == providerSlug);
        if (patientId is not null)
            query = query.Where(a => a.PatientId == patientId);
        if (insuranceName is not null)
            query = query.Where(a => a.InsuranceName == insuranceName);
        if (expiresat_gt is not null)
            query = query.Where(a => a.ExpiresAt > expiresat_gt);
        if (expiresat_lt is not null)
            query = query.Where(a => a.ExpiresAt < expiresat_lt);
        if (expired is not null)
            query = query.Where(a => a.Expired == expired);
        if (aboutToExpire is not null)
            query = query.Where(a => a.AboutToExpire == aboutToExpire);
        if (aboutToBeFull is not null)
            query = query.Where(a => a.AboutToBeFull == aboutToBeFull);
        if (remainingsessions_gt is not null)
            query = query.Where(a => a.RemainingSessions > remainingsessions_gt);
        if (remainingsessions_lt is not null)
            query = query.Where(a => a.RemainingSessions < remainingsessions_lt);
        if (orderby == "remainingsessions")
            query = query.OrderBy(a => a.RemainingSessions);
        else
            query = query.OrderByDescending(a => a.ExpiresAt);

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

    [HttpGet("notifications")]
    [RequireProviderPermission(".notifications:read")]
    public async Task<PagedResponse<Notification>> ListNotifications(
        [FromQuery] string? providerSlug = null,
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
        if (providerSlug is not null)
            query = query.Where(n => n.ProviderSlug == providerSlug);
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

    [HttpGet("treatment-sessions")]
    [RequireProviderPermission(".treatment-sessions:read")]
    public async Task<PagedResponse<TreatmentSession>> ListTreatmentSessions(
        [FromQuery] string? providerSlug = null,
        [FromQuery] int? patientId = null,
        [FromQuery] int? insuranceAuthorizationId = null,
        [FromQuery] bool? paymentReceived = null,
        [FromQuery] bool? hasAuthorization = null,
        [FromQuery] DateTime? start_gt = null,
        [FromQuery] DateTime? start_lt = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 0)
    {
        if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
        if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
        if (page < 1) page = 1;

        var query = context.TreatmentSessions.AsQueryable();
        if (providerSlug is not null)
            query = query.Where(s => s.ProviderSlug == providerSlug);
        if (patientId is not null)
            query = query.Where(s => s.PatientId == patientId);
        if (insuranceAuthorizationId is not null)
            query = query.Where(s => s.InsuranceAuthorizationId == insuranceAuthorizationId);
        if (paymentReceived is not null)
            query = query.Where(s => s.PaymentReceived == paymentReceived);
        if (hasAuthorization != null)
        {
            if (hasAuthorization == true)
            {
                query = query.Where(s => s.InsuranceAuthorizationId != null);
            }
            else
            {
                query = query.Where(s => s.InsuranceAuthorizationId == null);
            }
        }
        if (start_gt is not null)
            query = query.Where(s => s.Start > start_gt);
        if (start_lt is not null)
            query = query.Where(s => s.Start < start_lt);
        query = query.OrderByDescending(s => s.Start);

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
}
