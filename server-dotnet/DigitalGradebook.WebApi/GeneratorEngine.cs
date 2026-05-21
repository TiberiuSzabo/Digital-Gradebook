using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore; // AM ADĂUGAT: pentru FirstOrDefaultAsync
using DigitalGradebook.Repository;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Service; // AM ADĂUGAT: pentru spion (IAuditLoggerService)

namespace DigitalGradebook.WebApi
{
    // Țeava de SignalR
    public class GeneratorHub : Hub { }

    // STAREA (asta e clasa pe care nu o găsea controller-ul tău!)
    public class GeneratorState
    {
        public bool IsRunning { get; set; } = false;
    }

    // Robotul care muncește în fundal
    public class GeneratorWorker : BackgroundService
    {
        private readonly IHubContext<GeneratorHub> _hubContext;
        private readonly GeneratorState _state;
        private readonly IServiceProvider _serviceProvider;

        public GeneratorWorker(IHubContext<GeneratorHub> hubContext, GeneratorState state, IServiceProvider serviceProvider)
        {
            _hubContext = hubContext;
            _state = state;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var random = new Random();
            var firstNames = new[] { "Ion", "Cristian", "Maria", "Andrei", "Elena", "Mihai", "Ana", "Alex", "Ioana" };
            var lastNames = new[] { "Popescu", "Ionescu", "Radu", "Dumitrescu", "Stan", "Matei", "Gheorghe" };

            while (!stoppingToken.IsCancellationRequested)
            {
                if (_state.IsRunning)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    // Scoatem "spionul" din cutie ca să putem loga
                    var auditLogger = scope.ServiceProvider.GetRequiredService<IAuditLoggerService>();

                    var fName = firstNames[random.Next(firstNames.Length)];
                    var lName = lastNames[random.Next(lastNames.Length)];
                    var rndNum = random.Next(1000, 9999);

                    // Construim un elev nou complet cu date random
                    var newStudent = new Student
                    {
                        FirstName = fName,
                        LastName = lName,
                        Email = $"{fName.ToLower()}.{lName.ToLower()}{rndNum}@student.com",
                        BirthDate = $"{random.Next(1, 29):D2}/{random.Next(1, 13):D2}/2015",
                        Cnp = $"5150101{random.Next(100000, 999999)}",
                        Username = $"{fName}{lName}{rndNum}",
                        UniqueNumber = $"7Y{rndNum}{random.Next(10, 99)}",
                        ParentDad = $"Tatal lui {fName}",
                        ParentMom = $"Mama lui {fName}",
                        PhoneMom = $"07{random.Next(10000000, 99999999)}",
                        PhoneDad = $"07{random.Next(10000000, 99999999)}",
                        Mentions = "Generat automat de robot"
                    };

                    db.Students.Add(newStudent);
                    await db.SaveChangesAsync(); // Aici elevul primește ID-ul lui

                    // ========================================================
                    // CREAREA AUTOMATĂ A CONTURILOR PENTRU ELEVUL GENERAT
                    // ========================================================
                    var studentRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Student");
                    var parentRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Parent");

                    if (studentRole != null && !string.IsNullOrEmpty(newStudent.Email))
                    {
                        db.Users.Add(new User
                        {
                            Username = newStudent.Email,
                            Password = newStudent.FirstName,
                            RoleId = studentRole.Id,
                            StudentId = newStudent.Id
                        });
                    }

                    if (parentRole != null && !string.IsNullOrEmpty(newStudent.Email))
                    {
                        var prefixEmail = newStudent.Email.Split('@')[0];
                        var emailParinte = "parent_" + prefixEmail + "@parent.com";

                        db.Users.Add(new User
                        {
                            Username = emailParinte,
                            Password = newStudent.FirstName, // Parola e tot prenumele (ex: "Ion")
                            RoleId = parentRole.Id,
                            StudentId = newStudent.Id
                        });
                    }

                    await db.SaveChangesAsync(); // Salvăm noile conturi

                    // ========================================================
                    // 🚨 GOLD CHALLENGE: SPIONUL NOTEAZĂ ACȚIUNEA
                    // ========================================================
                    await auditLogger.LogActionAsync(
                        userId: "SYSTEM_ROBOT",
                        role: "ADMIN",
                        actionInformation: $"Robotul a generat elevul: {newStudent.LastName} {newStudent.FirstName} și conturile sale."
                    );

                    // Anunțăm React-ul că a venit un elev nou!
                    await _hubContext.Clients.All.SendAsync("NewStudentAdded");
                }

                // Generăm un elev la fiecare 3 secunde
                await Task.Delay(3000, stoppingToken);
            }
        }
    }
}