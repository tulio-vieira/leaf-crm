using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class LeadRequest
    {
        public required string Name { get; set; }

        public string? Description { get; set; } = string.Empty;

        public required int BoardId { get; set; }

        public required int CustomerId { get; set; }

        public required int ColumnIdx { get; set; }

        public required string Position { get; set; }

        public Guid? AssignedToUserGuid { get; set; }


        public Lead ToEntity(UserClaims c, User? userAssigned)
        {
            var lead = new Lead()
            {
                Name = Name,
                Description = Description,
                BoardId = BoardId,
                CustomerId = CustomerId,
                ColumnIdx = ColumnIdx,
                Position = Position,
                ChangedByUserGuid = c.Id,
                ChangedByUserName = c.Name,
                CreatedByUserGuid = c.Id,
                CreatedByUserName = c.Name,
            };
            if (userAssigned != null) {
                lead.AssignedToUserGuid = userAssigned.Id;
                lead.AssignedToUserName = userAssigned.Name;
            }
            return lead;
        }
    }
}
