using DigitalGradebook.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DigitalGradebook.Service
{
    public interface IStudentService
    {
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        Task<Student?> GetStudentByIdAsync(int id);
        Task<Student> CreateStudentAsync(Student student);
        Task UpdateStudentAsync(Student student);
        Task DeleteStudentAsync(int id);
    }
}