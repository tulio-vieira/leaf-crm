
using System.ComponentModel.DataAnnotations;
using WebAPI.Dtos;
using WebAPI.Errors;

namespace WebAPI.Models
{
    public class Lead
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(60)]
        public required string Name { get; set; }

        public string? Description { get; set; } = string.Empty;

        public required int BoardId { get; set; }

        public Board? Board { get; set; }

        public required int ColumnIdx { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

        [StringLength(60)]
        public string ChangedBy { get; set; } = string.Empty;

        public void Validate(Board board)
        {
            if (ColumnIdx < 0 || ColumnIdx >= board.Columns.Count)
                throw new ServiceException("Índice de coluna inválido para este quadro.");
        }

        public void UpdateFromRequest(LeadRequest r, string changedBy)
        {
            Name = r.Name;
            Description = r.Description;
            BoardId = r.BoardId;
            ColumnIdx = r.ColumnIdx;
            ModifiedAt = DateTime.UtcNow;
            ChangedBy = changedBy;
        }
    }
}
