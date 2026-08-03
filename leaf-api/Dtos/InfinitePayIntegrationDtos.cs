using LeafAPI.Models;

namespace WebAPI.Dtos
{
    public class InfinitePayIntegrationCreateRequest
    {
        public required int LeadId { get; set; }
        public List<Item> Items { get; set; } = [];
    }
}
