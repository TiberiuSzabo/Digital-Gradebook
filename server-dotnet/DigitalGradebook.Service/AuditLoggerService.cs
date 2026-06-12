using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository; // Aici e AppDbContext-ul tău

namespace DigitalGradebook.Service
{
    public class AuditLoggerService : IAuditLoggerService
    {
        private readonly ApplicationDbContext _context; // Pune numele real al DbContext-ului tău

        public AuditLoggerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogActionAsync(string userId, string role, string actionInformation)
        {
            var log = new LogEntry
            {
                UserId = userId,
                Role = role.ToUpper(),
                ActionInformation = actionInformation,
                Timestamp = DateTime.UtcNow
            };

            _context.Logs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task FlagSuspiciousUserAsync(string userId, string username, string role, string reason)
        {
            var suspect = new SuspiciousUser
            {
                UserId = userId,
                Username = username,
                Role = role.ToUpper(),
                Reason = reason,
                DetectedAt = DateTime.UtcNow
            };

            _context.SuspiciousUsers.Add(suspect);
            await _context.SaveChangesAsync();
        }
    }
}