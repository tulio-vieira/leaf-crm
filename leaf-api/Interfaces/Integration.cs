using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebAPI.Models;

namespace LeafAPI.Interfaces
{
    public abstract class Integration
    {
        [Key]
        public int Id { get; set; }
        
        public int LeadId { get; set; }
        
        public int BoardId { get; set; }
        
        public required string Link { get; set; }
        
        public required Webhook Webhook { get; set; }

        [ForeignKey(nameof(BoardId))]
        public Board? Board { get; set; }

        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }
    }

    public class Webhook
    {
        public required string RequestSent { get; set; }
        
        public required string ResponsePayload { get; set; }
        
        public required int ResponseStatus { get; set; }
        
        public string? PayloadReceived { get; set; } = null;
        
        public DateTime PayloadReceivedAt { get; set; }
    }

    public class IntegrationSetting
    {
        public bool Enabled { get; set; } = false;
        
        public int DestinationColumn { get; set; } = 0;
        
        public bool AllowBypassRules { get; set; } = false;
    }
}
