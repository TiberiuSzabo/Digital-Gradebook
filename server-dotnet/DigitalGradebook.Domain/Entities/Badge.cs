using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DigitalGradebook.Domain.Entities
{
    [Table("Badges")]
    public class Badge
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int StudentId { get; set; }

        public int AwardedByUserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        public DateTime AwardedAt { get; set; }

        [JsonIgnore]
        public virtual Student? Student { get; set; }
    }
}
