using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class LeadUpdateRequest {
        public string? Description { get; set; } = string.Empty;

        public required int BoardId { get; set; }

        public required int ColumnIdx { get; set; }

        public required string Position { get; set; }

        public Guid? AssignedToUserGuid { get; set; }
    }


    public class LeadCreateRequest : LeadUpdateRequest
    {
        public required int CustomerId { get; set; }

        public Lead ToEntity(UserClaims claims, User? userAssigned, Customer customer)
        {
            var lead = new Lead()
            {
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                Description = Description,
                BoardId = BoardId,
                ColumnIdx = ColumnIdx,
                Position = Position,
                ChangedByUserGuid = claims.Id,
                ChangedByUserName = claims.Name,
                CreatedByUserGuid = claims.Id,
                CreatedByUserName = claims.Name,
            };
            if (userAssigned != null) {
                lead.AssignedToUserGuid = userAssigned.Id;
                lead.AssignedToUserName = userAssigned.Name;
            }
            return lead;
        }
    }
}
