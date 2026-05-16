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
    [Route("api/customers")]
    [ApiController]
    public class CustomersController(
        DataContext context,
        IOptions<PaginationOptions> paginationOptions) : ControllerBase
    {
        private readonly PaginationOptions _pagination = paginationOptions.Value;

        [HttpGet]
        [RequirePermission("customers:read")]
        public async Task<PagedResponse<Customer>> ListCustomers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 0)
        {
            if (pageSize <= 0) pageSize = _pagination.DefaultPageSize;
            if (pageSize > _pagination.MaxPageSize) pageSize = _pagination.MaxPageSize;
            if (page < 1) page = 1;

            var query = context.Customers.OrderBy(c => c.Name);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            return new PagedResponse<Customer>
            {
                Items = items.Take(pageSize).ToList(),
                Page = page,
                PageSize = pageSize,
                HasNextPage = items.Count > pageSize
            };
        }

        [HttpGet("{id}")]
        [RequirePermission("customers:read")]
        public async Task<Customer> GetCustomer(int id)
        {
            return await context.Customers.FindAsync(id)
                ?? throw new NotFoundException("Cliente não encontrado.");
        }

        [HttpPost]
        [RequirePermission("customers:write")]
        public async Task<ActionResult<Customer>> CreateCustomer(CustomerRequest request)
        {
            var customer = request.ToEntity();
            context.Customers.Add(customer);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        [RequirePermission("customers:write")]
        public async Task<Customer> UpdateCustomer(int id, CustomerRequest request)
        {
            var customer = await context.Customers.FindAsync(id)
                ?? throw new NotFoundException("Cliente não encontrado.");

            customer.UpdateFromRequest(request);

            context.Entry(customer).State = EntityState.Modified;
            await context.SaveChangesAsync();
            return customer;
        }

        [HttpDelete("{id}")]
        [RequirePermission("customers:delete")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await context.Customers.FindAsync(id)
                ?? throw new NotFoundException("Cliente não encontrado.");

            context.Customers.Remove(customer);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
