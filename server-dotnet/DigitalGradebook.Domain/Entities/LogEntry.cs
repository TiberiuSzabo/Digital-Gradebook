namespace DigitalGradebook.Domain.Entities
{
    public class LogEntry
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string Role { get; set; } = null!; // Grupul (ex: ADMIN sau USER)
        public string ActionInformation { get; set; } = null!;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Proprietate care formatează textul exact cum a cerut proful pe foaie:
        // USER_ID:GROUP_ID[ADMIN/USER]:ACTION_INFORMATION:TIMESTAMP
        public string FormattedMessage => $"{UserId}:{Role}:{ActionInformation}:{Timestamp:yyyy-MM-dd HH:mm:ss}";
    }
}