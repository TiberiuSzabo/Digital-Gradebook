using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using DigitalGradebook.Repository;
using DigitalGradebook.Domain.Entities;

namespace DigitalGradebook.Tests
{
	public class DatabaseTests
	{
		// Funcție ajutătoare pentru a crea o bază de date nouă în RAM pentru fiecare test
		private ApplicationDbContext GetInMemoryDbContext()
		{
			var options = new DbContextOptionsBuilder<ApplicationDbContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
				.Options;

			return new ApplicationDbContext(options);
		}

		[Fact]
		public async Task AddStudent_ShouldSaveToDatabase()
		{
			// Arrange
			using var context = GetInMemoryDbContext();
			var newStudent = new Student
			{
				FirstName = "Test",
				LastName = "Student",
				Email = "test@student.ro",
				BirthDate = "2010-01-01",
				Cnp = "5000000000000"
			};

			// Act
			context.Students.Add(newStudent);
			await context.SaveChangesAsync();

			// Assert
			var savedStudent = await context.Students.FirstOrDefaultAsync(s => s.Email == "test@student.ro");
			Assert.NotNull(savedStudent);
			Assert.Equal("Test", savedStudent.FirstName);
		}

		[Fact]
		public async Task AddGradeToStudent_ShouldSaveSuccessfully()
		{
			// Arrange
			using var context = GetInMemoryDbContext();
			var student = new Student { FirstName = "Ion", LastName = "Pop" };
			context.Students.Add(student);
			await context.SaveChangesAsync();

			var grade = new Grade
			{
				StudentId = student.Id,
				SubjectName = "Math",
				Value = "FB"
			};

			// Act
			context.Grades.Add(grade);
			await context.SaveChangesAsync();

			// Assert
			var studentWithGrades = await context.Students.Include(s => s.Grades).FirstAsync();
			Assert.Single(studentWithGrades.Grades);
			Assert.Equal("FB", studentWithGrades.Grades.First().Value);
		}

		[Fact]
		public async Task DeleteStudent_ShouldRemoveFromDatabase()
		{
			// Arrange
			using var context = GetInMemoryDbContext();
			var student = new Student { FirstName = "To Be", LastName = "Deleted" };
			context.Students.Add(student);
			await context.SaveChangesAsync();

			// Act
			context.Students.Remove(student);
			await context.SaveChangesAsync();

			// Assert
			var deletedStudent = await context.Students.FirstOrDefaultAsync(s => s.LastName == "Deleted");
			Assert.Null(deletedStudent);
		}

		[Fact]
		public async Task CheckThirdNormalForm_StudentAndGrades_AreSeparateEntities()
		{
			// Arrange
			using var context = GetInMemoryDbContext();
			var student = new Student { FirstName = "Ana", LastName = "Maria" };
			context.Students.Add(student);
			await context.SaveChangesAsync();

			context.Grades.Add(new Grade { StudentId = student.Id, SubjectName = "Biology", Value = "FB" });
			context.Grades.Add(new Grade { StudentId = student.Id, SubjectName = "History", Value = "B" });
			await context.SaveChangesAsync();

			// Act
			var allGrades = await context.Grades.ToListAsync();
			var studentsCount = await context.Students.CountAsync();

			// Assert (Demonstrează 3NF: Datele sunt în tabele separate, legate prin ID)
			Assert.Equal(1, studentsCount);
			Assert.Equal(2, allGrades.Count);
			Assert.True(allGrades.All(g => g.StudentId == student.Id));
		}
	}
}