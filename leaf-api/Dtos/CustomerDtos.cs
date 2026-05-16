using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class CustomerRequest
    {
        public required string Name { get; set; }

        public string? Description { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public string? Company { get; set; }

        public Customer ToEntity()
        {
            return new Customer
            {
                Name = Name,
                Description = Description,
                Email = Email,
                PhoneNumber = PhoneNumber,
                Address = Address,
                Company = Company,
            };
        }
    }
}
