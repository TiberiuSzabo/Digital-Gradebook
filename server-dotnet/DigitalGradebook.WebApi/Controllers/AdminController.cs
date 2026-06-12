using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;

namespace DigitalGradebook.WebApi.Controllers
{
    public class CreateUserInput
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int? StudentId { get; set; }
    }

    public class ChangeRoleInput
    {
        public string NewRole { get; set; } = string.Empty;
    }

    public class ResetPasswordInput
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    [Authorize(Roles = "Admin")]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    Role = u.Role.Name,
                    u.StudentId
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserInput input)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == input.Role);
            if (role == null) return BadRequest(new { message = "Invalid role." });

            var user = new User
            {
                Username = input.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password),
                RoleId = role.Id,
                StudentId = input.StudentId,
                SecurityPinHash = string.Empty
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.Username, Role = role.Name, user.StudentId });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleInput input)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == input.NewRole);
            if (role == null) return BadRequest(new { message = "Invalid role." });

            user.RoleId = role.Id;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Role updated." });
        }

        [HttpPut("users/{id}/password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordInput input)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Password updated." });
        }

        [HttpPut("users/{id}/add-role")]
        public async Task<IActionResult> AddRole(int id, [FromBody] ChangeRoleInput input)
        {
            var existing = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (existing == null) return NotFound();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == input.NewRole);
            if (role == null) return BadRequest(new { message = "Invalid role." });

            var duplicate = new User
            {
                Username = existing.Username,
                PasswordHash = existing.PasswordHash,
                RoleId = role.Id,
                StudentId = existing.StudentId,
                SecurityPinHash = existing.SecurityPinHash
            };

            _context.Users.Add(duplicate);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Second role entry created.", newUserId = duplicate.Id });
        }

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
