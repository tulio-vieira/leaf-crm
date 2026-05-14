using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class LeadRequest
    {
        public required string Name { get; set; }

        public string? Description { get; set; } = string.Empty;

        public required int BoardId { get; set; }

        public required int ColumnIdx { get; set; }

        public required string Position { get; set; }

        public Lead ToEntity(string changedBy)
        {
            return new Lead()
            {
                Name = Name,
                Description = Description,
                BoardId = BoardId,
                ColumnIdx = ColumnIdx,
                Position = Position,
                ChangedBy = changedBy
            };
        }
    }
}
