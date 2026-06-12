using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalGradebook.Domain.Entities
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Username { get; set; }

        // Parola este stocată ca hash BCrypt, nu plaintext
        public string PasswordHash { get; set; }

        public int RoleId { get; set; }
        public Role Role { get; set; }

        public int? StudentId { get; set; }
        public Student Student { get; set; }

        // --- SILVER CHALLENGE: 3-Way Auth & Password Recovery ---
        public string? TwoFactorCode { get; set; }
        public DateTime? TwoFactorExpiry { get; set; }

        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }

        // AL TREILEA FACTOR (3FA): PIN-ul de securitate (stocat ca hash)
        public string SecurityPinHash { get; set; } = string.Empty;
    }
}