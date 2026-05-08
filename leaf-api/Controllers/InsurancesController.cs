using WebAPI.Authorization;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Errors;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[Authorize]
[Route("api/insurances")]
[ApiController]
public class InsurancesController(DataContext context) : ControllerBase
{
    [HttpGet]
    [RequirePermission("insurances:read")]
    public async Task<List<Insurance>> GetInsurances()
    {
        return await context.Insurances.OrderBy(i => i.Name).ToListAsync();
    }

    [HttpGet("{id}")]
    [RequirePermission("insurances:read")]
    public async Task<Insurance> GetInsurance(int id)
    {
        return await context.Insurances.FindAsync(id)
            ?? throw new NotFoundException("Convênio não encontrado.");
    }

    [HttpPost]
    [RequirePermission("insurances:write")]
    public async Task<ActionResult<Insurance>> CreateInsurance(InsuranceRequest request)
    {
        var insurance = request.MapFromRequest();
        context.Insurances.Add(insurance);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(CreateInsurance), insurance);
    }

    [HttpPut("{id}")]
    [RequirePermission("insurances:write")]
    public async Task<Insurance> UpdateInsurance(int id, InsuranceRequest request)
    {
        var insurance = await context.Insurances.FindAsync(id)
            ?? throw new NotFoundException("Convênio não encontrado.");

        request.UpdateFromRequest(insurance);
        context.Entry(insurance).State = EntityState.Modified;
        await context.SaveChangesAsync();
        return insurance;
    }

    [HttpDelete("{id}")]
    [RequirePermission("insurances:delete")]
    public async Task<IActionResult> DeleteInsurance(int id)
    {
        var insurance = await context.Insurances.FindAsync(id)
            ?? throw new NotFoundException("Convênio não encontrado.");

        context.Insurances.Remove(insurance);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
