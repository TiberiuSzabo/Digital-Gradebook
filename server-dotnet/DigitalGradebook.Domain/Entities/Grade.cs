using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DigitalGradebook.Domain.Entities
{
    [Table("Grades")]
    public class Grade
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string SubjectName { get; set; } = string.Empty; // ex: "Math", "English"

        [Required]
        [MaxLength(2)]
        public string Value { get; set; } = string.Empty; // FB, B, S, I

        // Foreign Key către Student
        [Required]
        public int StudentId { get; set; }

        [JsonIgnore]
        [ForeignKey("StudentId")]
        public virtual Student? Student { get; set; }
    }
}