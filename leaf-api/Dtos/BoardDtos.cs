using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class BoardDetailResponse
    {
        public required Board Board { get; set; }
        public required List<int> ColumnCounts { get; set; }
    }

    public class BoardCreateRequest : BoardUpdateRequest
    {
        public List<Column> Columns { get; set; } = [];


        public Board ToEntity()
        {
            return new Board()
            {
                Name = Name,
                Description = Description,
                Columns = Columns,
            };
        }
    }

    public class BoardUpdateRequest
    {
        public required string Name { get; set; }

        public string? Description { get; set; } = string.Empty;
    }
}
