using LeafAPI.Interfaces;
using LeafAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebAPI.Authorization;
using WebAPI.Configuration;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Errors;

namespace WebAPI.Controllers
{
    [Authorize]
    [Route("api/infinite-pay")]
    [ApiController]
    public class InfinitePayIntegrationsController(
        DataContext context,
        IHttpClientFactory httpClientFactory,
        IOptions<InfinitePayOptions> infinitePayOptions,
        IConfiguration configuration) : ControllerBase
    {
        [HttpGet("{id}")]
        [RequirePermission("integrations:read")]
        public async Task<InfinitePayIntegration> GetInfinitePayIntegration(int id)
        {
            return await context.InfinitePayIntegrations.FindAsync(id)
                ?? throw new NotFoundException("Integração não encontrada.");
        }

        [HttpPost]
        [RequirePermission("integrations:write")]
        public async Task<ActionResult<InfinitePayIntegration>> CreateInfinitePayIntegration(
            InfinitePayIntegrationCreateRequest request)
        {
            // TODO: if a lead already has an infinitepay integration, throw an error. Figure out how to ensure 1 to 1 relation (not 1 to many)
            var lead = await context.Leads
                .Include(l => l.Customer)
                .FirstOrDefaultAsync(l => l.Id == request.LeadId)
                ?? throw new NotFoundException("Lead não encontrado.");

            // Save placeholder first to obtain the auto-generated Id for order_nsu
            var integration = new InfinitePayIntegration
            {
                LeadId = request.LeadId,
                BoardId = lead.BoardId,
                Link = "",
                Items = request.Items,
                Webhook = new Webhook
                {
                    RequestSent = "{}",
                    ResponsePayload = "{}",
                    ResponseStatus = 0
                }
            };
            context.InfinitePayIntegrations.Add(integration);
            await context.SaveChangesAsync();

            var options = infinitePayOptions.Value;
            var siteUrl = configuration.GetRequiredValue("SiteUrl");
            var customer = lead.Customer!;

            var payload = new
            {
                handle = options.Handle,
                items = request.Items.Select(i => new
                {
                    quantity = i.Quantity,
                    price = i.PriceCents,
                    description = i.Description
                }),
                order_nsu = integration.Id.ToString(),
                //webhook_url = $"{siteUrl}/infinite-pay/webhook",
                customer = new
                {
                    name = customer.Name,
                    email = customer.Email,
                    phone_number = customer.PhoneNumber
                }
            };

            var requestJson = JsonSerializer.Serialize(payload);
            var client = httpClientFactory.CreateClient("infinitepay");
            var httpResponse = await client.PostAsJsonAsync(options.APIUrl, payload);
            var responseBody = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
                throw new ServiceException($"Erro ao criar cobrança no InfinitePay: {responseBody}");

            var responseData = JsonSerializer.Deserialize<InfinitePayCreateResponse>(responseBody)!;

            integration.Link = responseData.Url;
            integration.Webhook = new Webhook
            {
                RequestSent = requestJson,
                ResponseStatus = (int)httpResponse.StatusCode,
                ResponsePayload = responseBody
            };
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInfinitePayIntegration), new { id = integration.Id }, integration);
        }

        [HttpDelete("{id}")]
        [RequirePermission("integrations:delete")]
        public async Task<IActionResult> DeleteInfinitePayIntegration(int id)
        {
            var integration = await context.InfinitePayIntegrations.FindAsync(id)
                ?? throw new NotFoundException("Integração não encontrada.");

            context.InfinitePayIntegrations.Remove(integration);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }

    internal class InfinitePayCreateResponse
    {
        [JsonPropertyName("url")]
        public required string Url { get; set; }
    }
}
