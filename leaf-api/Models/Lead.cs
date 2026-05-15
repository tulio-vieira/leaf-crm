
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using WebAPI.Dtos;
using WebAPI.Errors;

namespace WebAPI.Models
{
    [Index(nameof(BoardId), nameof(ColumnIdx), nameof(Position))]
    public class Lead
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(60)]
        public required string Name { get; set; }

        public string? Description { get; set; } = string.Empty;

        public required int BoardId { get; set; }

        [ForeignKey(nameof(BoardId))]
        [DeleteBehavior(DeleteBehavior.Cascade)]
        public Board? Board { get; set; }

        public required int ColumnIdx { get; set; }

        public required string Position { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

        public required Guid ChangedByUserGuid { get; set; }

        [StringLength(60)]
        public required string ChangedByUserName { get; set; }

        public required Guid CreatedByUserGuid { get; set; }

        [StringLength(60)]
        public required string CreatedByUserName { get; set; }

        public Guid? AssignedToUserGuid { get; set; }

        [StringLength(60)]
        public string? AssignedToUserName { get; set; }

        public void Validate(Board board)
        {
            if (ColumnIdx < 0 || ColumnIdx >= board.Columns.Count)
                throw new ServiceException("Índice de coluna inválido para este quadro.");
        }

        public void UpdateFromRequest(
            LeadRequest r,
            UserClaims c,
            bool isNewUserAssignment,
            User? userAssigned
        )
        {
            Name = r.Name;
            Description = r.Description;
            BoardId = r.BoardId;
            ColumnIdx = r.ColumnIdx;
            Position = r.Position;
            ModifiedAt = DateTime.UtcNow;
            ChangedByUserGuid = c.Id;
            ChangedByUserName = c.Name;
            if (isNewUserAssignment)
            {
                if (userAssigned == null)
                {
                    AssignedToUserGuid = null;
                    AssignedToUserName = null;
                } else
                {
                    AssignedToUserName = userAssigned.Name;
                    AssignedToUserGuid = userAssigned.Id;
                }
            }
        }
    }
}
