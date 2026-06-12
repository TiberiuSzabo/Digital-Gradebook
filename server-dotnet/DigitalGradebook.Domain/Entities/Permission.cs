using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Text;

namespace DigitalGradebook.Domain.Entities
{
    public class Permission
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } // ex: "MANAGE_STUDENTS", "CHAT_ALL", "CHAT_TEACHER"

        // Relatie Many-to-Many cu Role
        public ICollection<Role> Roles { get; set; } = new List<Role>();
    }
}