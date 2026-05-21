using Microsoft.AspNetCore.Authorization; // ADĂUGAT pentru [Authorize]
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using DigitalGradebook.WebApi;
using DigitalGradebook.Service; 

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

    // 🔒 SECURIZĂM CONTROLLERUL: Oricine vrea acces aici trebuie să aibă un Token JWT valid
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

        // 🔒 PERMISIUNE: Teacher, Student, Parent (Toți pot vedea lista)
        [Authorize(Roles = "Teacher,Student,Parent")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudents()
        {
            return await _context.Students.Include(s => s.Grades).ToListAsync();
        }

        // 🔒 PERMISIUNE: Teacher, Student, Parent (Toți pot vedea un elev anume)
        [Authorize(Roles = "Teacher,Student,Parent")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudent(int id)
        {
            var student = await _context.Students.Include(s => s.Grades).FirstOrDefaultAsync(s => s.Id == id);
            if (student == null) return NotFound();
            return student;
        }

        // 🔒 PERMISIUNE: DOAR Teacher (Elevii și Părinții nu pot adăuga elevi noi)
        [Authorize(Roles = "Teacher")]
        [HttpPost]
        public async Task<ActionResult<Student>> PostStudent(Student student)
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var studentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Student");
            var parentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Parent");

            if (studentRole != null && !string.IsNullOrEmpty(student.Email))
            {
                _context.Users.Add(new User
                {
                    Username = student.Email,
                    Password = student.FirstName,
                    RoleId = studentRole.Id,
                    StudentId = student.Id
                });
            }

            if (parentRole != null && !string.IsNullOrEmpty(student.Email))
            {
                var prefixEmail = student.Email.Split('@')[0];
                var emailParinte = "parent_" + prefixEmail + "@parent.com";

                _context.Users.Add(new User
                {
                    Username = emailParinte,
                    Password = student.FirstName,
                    RoleId = parentRole.Id,
                    StudentId = student.Id
                });
            }
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(
                userId: "TEACHER_ACTION",
                role: "ADMIN",
                actionInformation: $"A adăugat un elev nou în sistem: {student.LastName} {student.FirstName} (ID: {student.Id})"
            );

            return CreatedAtAction("GetStudent", new { id = student.Id }, student);
        }

        // 🔒 PERMISIUNE: DOAR Teacher
        [Authorize(Roles = "Teacher")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] Student student)
        {
            if (id != student.Id) return BadRequest();
            _context.Entry(student).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(
                userId: "TEACHER_ACTION",
                role: "ADMIN",
                actionInformation: $"A modificat detaliile elevului cu ID-ul {id}."
            );

            return NoContent();
        }

        // 🔒 PERMISIUNE: DOAR Teacher
        [Authorize(Roles = "Teacher")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            var associatedGrades = await _context.Grades.Where(g => g.StudentId == id).ToListAsync();
            if (associatedGrades.Any())
            {
                _context.Grades.RemoveRange(associatedGrades);
            }

            var associatedUsers = await _context.Users.Where(u => u.StudentId == id).ToListAsync();
            if (associatedUsers.Any())
            {
                _context.Users.RemoveRange(associatedUsers);
            }

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            await _auditLogger.LogActionAsync(
                userId: "TEACHER_ACTION",
                role: "ADMIN",
                actionInformation: $"A șters definitiv elevul {student.LastName} {student.FirstName} (ID: {id}) și conturile asociate."
            );

            return NoContent();
        }

        // 🔒 PERMISIUNE: DOAR Teacher (Doar profii adaugă note)
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

            await _auditLogger.LogActionAsync(
                userId: "TEACHER_ACTION",
                role: "ADMIN",
                actionInformation: $"A adăugat nota {input.GradeValue} la materia {input.SubjectName} pentru elevul {student.LastName} {student.FirstName} (ID: {id})."
            );

            return Ok(student);
        }

        // 🔒 PERMISIUNE: DOAR Teacher
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

                await _auditLogger.LogActionAsync(
                    userId: "TEACHER_ACTION",
                    role: "ADMIN",
                    actionInformation: $"A șters nota {deletedGrade.Value} la materia {subjectName} pentru elevul cu ID: {id}."
                );
            }
            return Ok();
        }

        // 🔒 PERMISIUNE: DOAR Teacher
        [Authorize(Roles = "Teacher")]
        [HttpPost("toggle-generator")]
        public IActionResult ToggleGenerator([FromBody] ToggleInput input, [FromServices] GeneratorState state)
        {
            state.IsRunning = input.IsRunning;

            _auditLogger.LogActionAsync(
                userId: "SYSTEM",
                role: "ADMIN",
                actionInformation: $"Generatorul automat de elevi a fost {(input.IsRunning ? "PORNIT" : "OPRIT")}."
            ).Wait();

            return Ok();
        }
    }
}