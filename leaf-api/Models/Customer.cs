using System.ComponentModel.DataAnnotations;
using WebAPI.Dtos;

namespace WebAPI.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        public string? Description { get; set; }

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(30)]
        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        [StringLength(100)]
        public string? Company { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

        public void UpdateFromRequest(CustomerRequest r)
        {
            Name = r.Name;
            Description = r.Description;
            Email = r.Email;
            PhoneNumber = r.PhoneNumber;
            Address = r.Address;
            Company = r.Company;
            ModifiedAt = DateTime.UtcNow;
        }
    }
}
