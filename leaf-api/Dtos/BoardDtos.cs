using WebAPI.Models;

namespace WebAPI.Dtos
{
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
