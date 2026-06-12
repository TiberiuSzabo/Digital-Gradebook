using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Repository;

namespace DigitalGradebook.WebApi.Controllers
{
    [Authorize(Roles = "Teacher")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuditController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Endpoint pentru Lista Neagră (Suspicious Users)
        [HttpGet("suspicious")]
        public async Task<IActionResult> GetSuspiciousUsers()
        {
            var users = await _context.SuspiciousUsers
                                      .OrderByDescending(u => u.DetectedAt)
                                      .ToListAsync();
            return Ok(users);
        }

        // Endpoint pentru tot Jurnalul (Logs)
        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _context.Logs
                                     .OrderByDescending(l => l.Timestamp)
                                     .ToListAsync();
            return Ok(logs);
        }
    }
}