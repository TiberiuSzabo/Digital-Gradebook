using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using DigitalGradebook.WebApi;
using DigitalGradebook.Service;
using System.Security.Claims;

namespace DigitalGradebook.WebApi.Controllers
{
    public class GradeInput
    {
        public string SubjectName { get; set; } = string.Empty;
        public string GradeValue { get; set; } = string.Empty;
    }

    public class ToggleInput
    {
        public bool IsRunning { get; set; }
    }

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLoggerService _auditLogger;

        public StudentsController(ApplicationDbContext context, IAuditLoggerService auditLogger)
        {
            _context = context;
            _auditLogger = auditLogger;
        }

        // Metodă helper pentru a extrage din JWT ID-ul și Rolul fără să le hardcodăm
        private (string UserId, string Role) GetCurrentUserClaims()
        {
            var userId = User.FindFirst("UserId")?.Value ?? "UNKNOWN_ID";
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "UNKNOWN_ROLE";
            return (userId, role);
        }

        [Authorize(Roles = "Teacher,Student,Parent")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents()
        {
            var (_, role) = GetCurrentUserClaims();

            if (role == "Teacher")
            {
                var all = await _context.Students.Include(s => s.Grades).ToListAsync();
                return Ok(all.Select(s => s.ToDto()));
            }

            var studentIdClaim = User.FindFirst("StudentId")?.Value;
            if (studentIdClaim == null) return Forbid();

            var studentId = int.Parse(studentIdClaim);
            var own = await _context.Students.Include(s => s.Grades).FirstOrDefaultAsync(s => s.Id == studentId);
            if (own == null) return NotFound();

            return Ok(new List<StudentDto> { own.ToDto() });
        }

        [Authorize(Roles = "Teacher,Student,Parent")]
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentDto>> GetStudent(int id)
        {
            var (_, role) = GetCurrentUserClaims();

            if (role != "Teacher")
            {
                var studentIdClaim = User.FindFirst("StudentId")?.Value;
                if (studentIdClaim == null || int.Parse(studentIdClaim) != id)
                    return Forbid();
            }

            var student = await _context.Students.Include(s => s.Grades).FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound();
            return Ok(student.ToDto());
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpPost]
        public async Task<ActionResult<StudentDto>> PostStudent([FromBody] StudentInputDto input)
        {
            var student = new Student
            {
                LastName = input.LastName,
                FirstName = input.FirstName,
                Email = input.Email,
                BirthDate = input.BirthDate,
                Cnp = input.Cnp,
                Username = input.Username,
                UniqueNumber = input.UniqueNumber,
                ParentDad = input.ParentDad,
                PhoneDad = input.PhoneDad,
                ParentMom = input.ParentMom,
                PhoneMom = input.PhoneMom,
                Mentions = input.Mentions,
                ClassYear = input.ClassYear
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Students.Add(student);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(student.Email))
                {
                    var studentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Student");
                    var parentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Parent");

                    if (studentRole != null && parentRole != null)
                    {
                        var (studentUser, parentUser, studentPwd, parentPwd, pin) =
                            StudentAccountHelper.CreateAccounts(student, studentRole, parentRole);

                        _context.Users.AddRange(studentUser, parentUser);
                        await _context.SaveChangesAsync();

                        Console.WriteLine($"\n[CONTURI ELEV] Student: {student.Email} / Parola: {studentPwd}  |  PIN 3FA: {pin}");
                        Console.WriteLine($"[CONTURI ELEV] Parinte: {parentUser.Username} / Parola: {parentPwd}  |  PIN 3FA: {pin}\n");
                    }
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            var claims = GetCurrentUserClaims();
            await _auditLogger.LogActionAsync(
                userId: claims.UserId,
                role: claims.Role,
                actionInformation: $"A adăugat un elev nou în sistem: {student.LastName} {student.FirstName} (ID: {student.Id})"
            );

            return CreatedAtAction("GetStudent", new { id = student.Id }, student.ToDto());
        }

        [Authorize(Roles = "Teacher")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] StudentInputDto input)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound();

            student.LastName = input.LastName;
            student.FirstName = input.FirstName;
            student.Email = input.Email;
            student.BirthDate = input.BirthDate;
            student.Cnp = input.Cnp;
            student.Username = input.Username;
            student.UniqueNumber = input.UniqueNumber;
            student.ParentDad = input.ParentDad;
            student.PhoneDad = input.PhoneDad;
            student.ParentMom = input.ParentMom;
            student.PhoneMom = input.PhoneMom;
            student.Mentions = input.Mentions;
            student.ClassYear = input.ClassYear;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Students.AnyAsync(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            var claims = GetCurrentUserClaims();
            await _auditLogger.LogActionAsync(
                userId: claims.UserId,
                role: claims.Role,
                actionInformation: $"A modificat detaliile elevului cu ID-ul {id}."
            );

            return NoContent();
        }

        [Authorize(Roles = "Teacher")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var associatedGrades = await _context.Grades.Where(g => g.StudentId == id).ToListAsync();
                if (associatedGrades.Any()) _context.Grades.RemoveRange(associatedGrades);

                var associatedUsers = await _context.Users.Where(u => u.StudentId == id).ToListAsync();
                if (associatedUsers.Any()) _context.Users.RemoveRange(associatedUsers);

                _context.Students.Remove(student);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            var claims = GetCurrentUserClaims();
            await _auditLogger.LogActionAsync(
                userId: claims.UserId,
                role: claims.Role,
                actionInformation: $"A șters definitiv elevul {student.LastName} {student.FirstName} (ID: {id}) și conturile asociate."
            );

            return NoContent();
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("{id}/grades")]
        public async Task<IActionResult> AddGrade(int id, [FromBody] GradeInput input)
        {
            var student = await _context.Students.Include(s => s.Grades).FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound("Elevul nu a fost găsit.");

            var newGrade = new Grade
            {
                StudentId = id,
                SubjectName = input.SubjectName,
                Value = input.GradeValue
            };

            _context.Grades.Add(newGrade);
            await _context.SaveChangesAsync();

            var claims = GetCurrentUserClaims();
            await _auditLogger.LogActionAsync(
                userId: claims.UserId,
                role: claims.Role,
                actionInformation: $"A adăugat nota {input.GradeValue} la materia {input.SubjectName} pentru elevul {student.LastName} {student.FirstName} (ID: {id})."
            );

            var updated = await _context.Students.Include(s => s.Grades).FirstOrDefaultAsync(s => s.Id == id);
            return Ok(updated!.ToDto());
        }

        [Authorize(Roles = "Teacher")]
        [HttpDelete("{id}/grades/{subjectName}/{gradeIndex}")]
        public async Task<IActionResult> RemoveGrade(int id, string subjectName, int gradeIndex)
        {
            var grades = await _context.Grades
                .Where(g => g.StudentId == id && g.SubjectName == subjectName)
                .ToListAsync();

            if (gradeIndex >= 0 && gradeIndex < grades.Count)
            {
                var deletedGrade = grades[gradeIndex];
                _context.Grades.Remove(deletedGrade);
                await _context.SaveChangesAsync();

                var claims = GetCurrentUserClaims();
                await _auditLogger.LogActionAsync(
                    userId: claims.UserId,
                    role: claims.Role,
                    actionInformation: $"A șters nota {deletedGrade.Value} la materia {subjectName} pentru elevul cu ID: {id}."
                );
            }
            return Ok();
        }

        [Authorize(Roles = "Teacher,Student,Parent,Admin")]
        [HttpGet("class/{classYear}")]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudentsByClass(int classYear)
        {
            var students = await _context.Students
                .Include(s => s.Grades)
                .Where(s => s.ClassYear == classYear)
                .ToListAsync();
            return Ok(students.Select(s => s.ToDto()));
        }

        [Authorize(Roles = "Teacher,Student,Parent,Admin")]
        [HttpGet("problems/{classYear}")]
        public async Task<IActionResult> GetProblems(int classYear)
        {
            var gradeWeight = new Dictionary<string, double>
            {
                { "FB", 4 }, { "B", 3 }, { "S", 2 }, { "I", 1 }
            };

            var badgeOpposites = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "bully", "pacificator" }, { "murdar", "gospodar" },
                { "lenes", "steaaclasei" }, { "mincinos", "coleganadejde" },
                { "dependenttelefon", "ecologist" }, { "obraznic", "cititorinrait" }
            };

            var badBadgeTypes = new HashSet<string>(badgeOpposites.Keys, StringComparer.OrdinalIgnoreCase);

            var students = await _context.Students
                .Include(s => s.Grades)
                .Where(s => s.ClassYear == classYear)
                .ToListAsync();

            var studentIds = students.Select(s => s.Id).ToList();
            var allBadges = await _context.Badges
                .Where(b => studentIds.Contains(b.StudentId))
                .ToListAsync();

            var badgesByStudent = allBadges
                .GroupBy(b => b.StudentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            static double SubjectAvg(Student s, string subject,
                Dictionary<string, double> weights)
            {
                var vals = s.Grades
                    .Where(g => g.SubjectName == subject && weights.ContainsKey(g.Value))
                    .Select(g => weights[g.Value])
                    .ToList();
                return vals.Count > 0 ? vals.Average() : 0;
            }

            var result = new List<object>();

            foreach (var student in students)
            {
                var studentBadges = badgesByStudent.GetValueOrDefault(student.Id, new List<Badge>());
                var problemBadges = studentBadges
                    .Where(b => badBadgeTypes.Contains(b.Type))
                    .Select(b => b.Type)
                    .Distinct()
                    .ToList();

                if (!problemBadges.Any()) continue;

                var weakSubjects = student.Grades
                    .Where(g => g.Value == "I" || g.Value == "S")
                    .Select(g => g.SubjectName)
                    .Distinct()
                    .ToList();

                var neededGoodBadges = problemBadges
                    .Where(b => badgeOpposites.ContainsKey(b))
                    .Select(b => badgeOpposites[b])
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                StudentDto? suggestedBuddy = null;

                foreach (var candidate in students.Where(c => c.Id != student.Id))
                {
                    var candidateBadges = badgesByStudent
                        .GetValueOrDefault(candidate.Id, new List<Badge>())
                        .Select(b => b.Type)
                        .ToHashSet(StringComparer.OrdinalIgnoreCase);

                    if (!neededGoodBadges.Any(nb => candidateBadges.Contains(nb)))
                        continue;

                    bool hasBetterGrade = weakSubjects.Any(subj =>
                        SubjectAvg(candidate, subj, gradeWeight) >
                        SubjectAvg(student, subj, gradeWeight));

                    if (hasBetterGrade)
                    {
                        suggestedBuddy = candidate.ToDto();
                        break;
                    }
                }

                result.Add(new
                {
                    student = student.ToDto(),
                    problemBadges,
                    suggestedBuddy
                });
            }

            return Ok(result);
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("toggle-generator")]
        public async Task<IActionResult> ToggleGenerator([FromBody] ToggleInput input, [FromServices] GeneratorState state) // REPARAT: Făcut async Task
        {
            state.IsRunning = input.IsRunning;

            var claims = GetCurrentUserClaims();

            // REPARAT: Folosim await în loc de .Wait() care risca deadlock
            await _auditLogger.LogActionAsync(
                userId: claims.UserId,
                role: claims.Role,
                actionInformation: $"Generatorul automat de elevi a fost {(input.IsRunning ? "PORNIT" : "OPRIT")}."
            );

            return Ok();
        }
    }
}