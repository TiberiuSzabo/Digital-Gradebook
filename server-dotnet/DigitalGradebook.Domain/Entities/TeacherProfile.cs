using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalGradebook.Domain.Entities
{
    [Table("TeacherProfiles")]
    public class TeacherProfile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        public virtual User? User { get; set; }
    }
}
