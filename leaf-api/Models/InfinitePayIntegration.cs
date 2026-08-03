using LeafAPI.Interfaces;

namespace LeafAPI.Models
{
    public class InfinitePayIntegration : Integration
    {
        public List<Item> Items { get; set; } = [];
    }

    // products included in the infinitepay payment link
    public class Item
    {
        public required string Description { get; set; }
        
        public required int PriceCents { get; set; }

        public required int Quantity { get; set; }
    }
}
