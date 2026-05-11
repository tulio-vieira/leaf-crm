using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Models
{
    [Index(nameof(UserEmail), IsUnique = true)]
    public class NotificationSubscription
    {
        [Key]
        public int Id { get; set; }
        public required string UserEmail { get; set; }
    }
}
