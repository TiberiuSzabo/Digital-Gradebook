using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;
using Microsoft.EntityFrameworkCore;

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

                context.Roles.AddRange(teacherRole, studentRole, parentRole);
                await context.SaveChangesAsync();
            }

            // 3. Generăm un cont de Admin (Profesor)
            if (!await context.Users.AnyAsync(u => u.Username == "admin"))
            {
                var teacherRole = await context.Roles.FirstAsync(r => r.Name == "Teacher");
                context.Users.Add(new User
                {
                    Username = "admin",
                    Password = "password",
                    RoleId = teacherRole.Id
                });
                await context.SaveChangesAsync();
            }

            // 4. Generăm conturi pentru Elevi și Părinți
            // 4. Generăm conturi pentru Elevi și Părinți automat pe baza Email-ului și Prenumelui
            var students = await context.Students.ToListAsync();
            var studentRoleDb = await context.Roles.FirstAsync(r => r.Name == "Student");
            var parentRoleDb = await context.Roles.FirstAsync(r => r.Name == "Parent");

            foreach (var student in students)
            {
                // Sărim dacă elevul nu are email trecut
                if (string.IsNullOrEmpty(student.Email)) continue;

                // Contul Elevului: Username = Email, Password = Prenume (ex: Alex)
                if (!await context.Users.AnyAsync(u => u.StudentId == student.Id && u.RoleId == studentRoleDb.Id))
                {
                    context.Users.Add(new User
                    {
                        Username = student.Email, // Folosim Email-ul la login
                        Password = student.FirstName, // Parola e prenumele
                        RoleId = studentRoleDb.Id,
                        StudentId = student.Id
                    });
                }

                // Contul Părintelui: Username = parent_email, Password = Prenume Elev
                var parentUsername = "parent_" + student.Email;
                if (!await context.Users.AnyAsync(u => u.StudentId == student.Id && u.RoleId == parentRoleDb.Id))
                {
                    context.Users.Add(new User
                    {
                        Username = parentUsername,
                        Password = student.FirstName,
                        RoleId = parentRoleDb.Id,
                        StudentId = student.Id
                    });
                }
            }
            await context.SaveChangesAsync();
        }
    }
}