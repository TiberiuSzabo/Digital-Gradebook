using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace DigitalGradebook.Domain.Entities
{
    public class Permission
    {
        public int Id { get; set; }
        public string Name { get; set; } // ex: "MANAGE_STUDENTS", "CHAT_ALL", "CHAT_TEACHER"

        // Relatie Many-to-Many cu Role
        public ICollection<Role> Roles { get; set; } = new List<Role>();
    }
}