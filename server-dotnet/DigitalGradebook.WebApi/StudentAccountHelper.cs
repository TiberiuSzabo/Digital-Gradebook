using DigitalGradebook.Domain.Entities;

namespace DigitalGradebook.WebApi
{
    public static class StudentAccountHelper
    {
        /// <summary>
        /// Creates student and parent User objects with secure random passwords.
        /// The 3FA PIN is the last 4 digits of the student's CNP (known to the student/parent).
        /// Returns generated passwords and the PIN so callers can log them once.
        /// </summary>
        public static (User StudentUser, User ParentUser, string StudentPassword, string ParentPassword, string Pin) CreateAccounts(
            Student student, Role studentRole, Role parentRole)
        {
            var studentPassword = PasswordHelper.GenerateSecurePassword();
            var parentPassword = PasswordHelper.GenerateSecurePassword();

            var pin = student.Cnp.Length >= 4
                ? student.Cnp[^4..]
                : student.Cnp.PadLeft(4, '0');

            var pinHash = BCrypt.Net.BCrypt.HashPassword(pin);
            var prefix = student.Email.Split('@')[0];

            var studentUser = new User
            {
                Username = student.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(studentPassword),
                SecurityPinHash = pinHash,
                RoleId = studentRole.Id,
                StudentId = student.Id
            };

            var parentUser = new User
            {
                Username = $"parent_{prefix}@parent.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(parentPassword),
                SecurityPinHash = pinHash,
                RoleId = parentRole.Id,
                StudentId = student.Id
            };

            return (studentUser, parentUser, studentPassword, parentPassword, pin);
        }
    }
}
