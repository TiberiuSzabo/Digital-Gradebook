namespace DigitalGradebook.Service
{
    public interface IAuditLoggerService
    {
        Task LogActionAsync(string userId, string role, string actionInformation);
        Task FlagSuspiciousUserAsync(string userId, string username, string role, string reason);
    }
}