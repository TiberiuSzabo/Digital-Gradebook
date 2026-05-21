using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalGradebook.Service
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        // Baza de date ne este "livrată" automat aici prin Dependency Injection
        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Student>> GetAllStudentsAsync()
        {
            // .Include() face un JOIN automat cu tabelul de Note, păstrând forma 3NF
            return await _context.Students
                .Include(s => s.Grades)
                .ToListAsync();
        }

        public async Task<Student> CreateStudentAsync(Student student)
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync(); // Aici se execută efectiv comanda de INSERT în SQL
            return student;
        }

        public async Task<Student?> GetStudentByIdAsync(int id) =>
            await _context.Students.Include(s => s.Grades).FirstOrDefaultAsync(s => s.Id == id);

        public async Task UpdateStudentAsync(Student student)
        {
            _context.Entry(student).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteStudentAsync(int id) // sau cum se numește metoda ta
        {
            var student = await _context.Students.FindAsync(id);
            if (student != null)
            {
                // 1. Ștergem userii asociați (părinte/elev) ca să nu luăm eroare de Foreign Key
                var associatedUsers = await _context.Users.Where(u => u.StudentId == id).ToListAsync();
                if (associatedUsers.Any())
                {
                    _context.Users.RemoveRange(associatedUsers);
                }

                // 2. Ștergem elevul
                _context.Students.Remove(student);
                await _context.SaveChangesAsync();
            }
        }
    }
}