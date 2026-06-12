using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace DigitalGradebook.Domain.Entities
{
    public class Role
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } // "Teacher", "Parent", "Student"

        // Relatie Many-to-Many cu Permission
        public ICollection<Permission> Permissions { get; set; } = new List<Permission>();

        // Un rol are mai multi Useri
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}