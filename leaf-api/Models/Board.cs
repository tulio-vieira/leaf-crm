
using System.ComponentModel.DataAnnotations;
using WebAPI.Dtos;
using WebAPI.Errors;

namespace WebAPI.Models
{
    public class Board
    {
        [Key]
        public int Id { get; private set; }

        [Required]
        [StringLength(60)]
        public required string Name { get; set; }

        public string? Description { get; set; } = string.Empty;

        public List<Column> Columns { get; set; } = [];

        public List<Lead>? Leads { get; set; }


        public void Validate()
        {
            if (Columns.Count == 0) throw new ServiceException("Quadro deve conter ao menos uma coluna.");
            var nameSet = new HashSet<string>();
            foreach (var c in Columns)
            {
                if (!nameSet.Add(c.Name)) throw new ServiceException("Quadro contém colunas com nomes repetidos.");
            }
        }

        public void UpdateFromRequest(BoardUpdateRequest r)
        {
            Name = r.Name;
            Description = r.Description;
        }
    }


    public class Column
    {
        public required string Name { get; set; }
    }
}

