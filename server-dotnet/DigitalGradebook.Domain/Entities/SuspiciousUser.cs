using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalGradebook.Domain.Entities
{
    public class SuspiciousUser
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string Username { get; set; } = null!; // Ca să-i vadă profu' direct numele
        public string Role { get; set; } = null!;
        public string Reason { get; set; } = null!; // De ce a fost prins (ex: "A incercat sa modifice note")
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    }
}