using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;

namespace DigitalGradebook.WebApi.Controllers
{
    public class TeacherProfileInput
    {
        public int UserId { get; set; }
        public string Subject { get; set; } = string.Empty;
    }

    [Authorize]
    [Route("api/teacherprofiles")]
    [ApiController]
    public class TeacherProfilesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeacherProfilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var profiles = await _context.TeacherProfiles
                .Include(tp => tp.User)
                    .ThenInclude(u => u!.Role)
                .Select(tp => new
                {
                    tp.Id,
                    tp.UserId,
                    Username = tp.User != null ? tp.User.Username : null,
                    Role = tp.User != null && tp.User.Role != null ? tp.User.Role.Name : null,
                    tp.Subject
                })
                .ToListAsync();
            return Ok(profiles);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Upsert([FromBody] TeacherProfileInput input)
        {
            var user = await _context.Users.FindAsync(input.UserId);
            if (user == null) return NotFound(new { message = "User not found." });

            var existing = await _context.TeacherProfiles
                .FirstOrDefaultAsync(tp => tp.UserId == input.UserId);

            if (existing != null)
            {
                existing.Subject = input.Subject;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            var profile = new TeacherProfile
            {
                UserId = input.UserId,
                Subject = input.Subject
            };

            _context.TeacherProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { }, profile);
        }
    }
}
