using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalGradebook.Domain.Entities
{
    [Table("Students")]
    public class Student
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Numele este obligatoriu")]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Prenumele este obligatoriu")]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(13, MinimumLength = 13)]
        public string Cnp { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string BirthDate { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [MaxLength(20)]
        public string UniqueNumber { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ParentDad { get; set; } = string.Empty;

        [MaxLength(15)]
        public string PhoneDad { get; set; } = string.Empty;
        public string ParentDadPhone { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ParentMom { get; set; } = string.Empty;

        [MaxLength(15)]
        public string PhoneMom { get; set; } = string.Empty;
        public string ParentMomPhone { get; set; } = string.Empty;


        public string Mentions { get; set; } = string.Empty;

        // Navigation Property: Relația 1-la-Mai-Mulți către Note
        public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();
    }
}