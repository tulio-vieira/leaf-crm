using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NuGet.Common;

namespace WebAPI.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        public int AmountCents { get; set; } = 0;

        public required DateTime CreatedAt;

        // TODO: Add correlation ID or something like that here.

        public int LeadId { get; set; }

        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }
    }
}
