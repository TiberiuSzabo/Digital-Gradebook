using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net; // AM ADĂUGAT PENTRU BCRYPT

namespace DigitalGradebook.WebApi
{
    public static class DataSeeder
    {
        public static async Task SeedRolesAndUsersAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Generăm Permisiunile
            if (!await context.Permissions.AnyAsync())
            {
                context.Permissions.AddRange(
                    new Permission { Name = "FULL_PERMISSIONS" },
                    new Permission { Name = "RESTRICTED_PERMISSIONS" }
                );
                await context.SaveChangesAsync();
            }

            // 2. Generăm Rolurile și le legăm de Permisiuni
            if (!await context.Roles.AnyAsync())
            {
                var fullPerm = await context.Permissions.FirstAsync(p => p.Name == "FULL_PERMISSIONS");
                var restrictedPerm = await context.Permissions.FirstAsync(p => p.Name == "RESTRICTED_PERMISSIONS");

                var teacherRole = new Role { Name = "Teacher" };
                teacherRole.Permissions.Add(fullPerm);

                var studentRole = new Role { Name = "Student" };
                studentRole.Permissions.Add(restrictedPerm);

                var parentRole = new Role { Name = "Parent" };
                parentRole.Permissions.Add(restrictedPerm);

                var adminRole = new Role { Name = "Admin" };
                adminRole.Permissions.Add(fullPerm);

                context.Roles.AddRange(teacherRole, studentRole, parentRole, adminRole);
                await context.SaveChangesAsync();
            }

            // 3. Generăm un cont de Admin (Profesor)
            if (!await context.Users.AnyAsync(u => u.Username == "admin"))
            {
                var teacherRole = await context.Roles.FirstAsync(r => r.Name == "Teacher");
                context.Users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"), // REPARAT AICI
                    RoleId = teacherRole.Id
                });
                await context.SaveChangesAsync();
            }

            // 3b. Generăm contul de superadmin
            if (!await context.Users.AnyAsync(u => u.Username == "superadmin"))
            {
                var adminRoleDb = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRoleDb == null) return;
                context.Users.Add(new User
                {
                    Username = "superadmin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    RoleId = adminRoleDb.Id
                });
                await context.SaveChangesAsync();
            }

            // 4. Generăm conturi pentru Elevi și Părinți automat pe baza Email-ului
            var students = await context.Students.ToListAsync();
            var studentRoleDb = await context.Roles.FirstAsync(r => r.Name == "Student");
            var parentRoleDb = await context.Roles.FirstAsync(r => r.Name == "Parent");

            foreach (var student in students)
            {
                if (string.IsNullOrEmpty(student.Email)) continue;

                var needsStudentAccount = !await context.Users.AnyAsync(u => u.StudentId == student.Id && u.RoleId == studentRoleDb.Id);
                var needsParentAccount  = !await context.Users.AnyAsync(u => u.StudentId == student.Id && u.RoleId == parentRoleDb.Id);

                if (!needsStudentAccount && !needsParentAccount) continue;

                var (studentUser, parentUser, studentPwd, parentPwd, pin) =
                    StudentAccountHelper.CreateAccounts(student, studentRoleDb, parentRoleDb);

                if (needsStudentAccount) context.Users.Add(studentUser);
                if (needsParentAccount)  context.Users.Add(parentUser);

                Console.WriteLine($"[SEED] {student.LastName} {student.FirstName} — student: {studentUser.Username} / {studentPwd}  |  parent: {parentUser.Username} / {parentPwd}  |  PIN: {pin}");
            }
            await context.SaveChangesAsync();
        }
    }
}