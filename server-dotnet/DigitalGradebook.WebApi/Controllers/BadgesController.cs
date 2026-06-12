using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;

namespace DigitalGradebook.WebApi.Controllers
{
    public class AwardBadgeInput
    {
        public int StudentId { get; set; }
        public string Type { get; set; } = string.Empty;
        public int AwardedByUserId { get; set; }
    }

    [Authorize]
    [Route("api/badges")]
    [ApiController]
    public class BadgesController : ControllerBase
    {
        private static readonly HashSet<string> GoodBadges = new(StringComparer.OrdinalIgnoreCase)
        {
            "pacificator", "gospodar", "steaaclasei", "coleganadejde", "ecologist", "cititorinrait"
        };

        private static readonly HashSet<string> BadBadges = new(StringComparer.OrdinalIgnoreCase)
        {
            "bully", "murdar", "lenes", "mincinos", "dependenttelefon", "obraznic"
        };

        private readonly ApplicationDbContext _context;

        public BadgesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Teacher,Student,Parent,Admin")]
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetBadgesForStudent(int studentId)
        {
            var badges = await _context.Badges
                .Where(b => b.StudentId == studentId)
                .ToListAsync();
            return Ok(badges);
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost]
        public async Task<IActionResult> AwardBadge([FromBody] AwardBadgeInput input)
        {
            var student = await _context.Students.FindAsync(input.StudentId);
            if (student == null) return NotFound("Student not found.");

            var badge = new Badge
            {
                StudentId = input.StudentId,
                Type = input.Type,
                AwardedByUserId = input.AwardedByUserId,
                AwardedAt = DateTime.UtcNow
            };

            _context.Badges.Add(badge);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBadgesForStudent), new { studentId = badge.StudentId }, badge);
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBadge(int id)
        {
            var badge = await _context.Badges.FindAsync(id);
            if (badge == null) return NotFound();

            _context.Badges.Remove(badge);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Teacher,Student,Parent,Admin")]
        [HttpGet("class/{classYear}")]
        public async Task<IActionResult> GetBadgesForClass(int classYear)
        {
            var studentIds = await _context.Students
                .Where(s => s.ClassYear == classYear)
                .Select(s => s.Id)
                .ToListAsync();

            var badges = await _context.Badges
                .Where(b => studentIds.Contains(b.StudentId))
                .ToListAsync();

            return Ok(badges);
        }

        [Authorize(Roles = "Teacher,Student,Parent,Admin")]
        [HttpGet("weather/{classYear}")]
        public async Task<IActionResult> GetWeatherForClass(int classYear)
        {
            var studentIds = await _context.Students
                .Where(s => s.ClassYear == classYear)
                .Select(s => s.Id)
                .ToListAsync();

            var badges = await _context.Badges
                .Where(b => studentIds.Contains(b.StudentId))
                .ToListAsync();

            int goodCount = badges.Count(b => GoodBadges.Contains(b.Type));
            int badCount = badges.Count(b => BadBadges.Contains(b.Type));
            int score = goodCount - badCount;

            string state = score > 15 ? "sunny"
                : score >= 5 ? "cloudy"
                : score >= -5 ? "rainy"
                : score >= -15 ? "stormy"
                : "tornado";

            return Ok(new { score, goodCount, badCount, state });
        }
    }
}
