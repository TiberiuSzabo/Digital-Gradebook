using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using DigitalGradebook.Repository;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Service;

namespace DigitalGradebook.WebApi
{
    public class GeneratorHub : Hub { }

    public class GeneratorState
    {
        public bool IsRunning { get; set; } = false;
    }

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
                    var auditLogger = scope.ServiceProvider.GetRequiredService<IAuditLoggerService>();

                    var fName = firstNames[random.Next(firstNames.Length)];
                    var lName = lastNames[random.Next(lastNames.Length)];
                    var rndNum = random.Next(1000, 9999);

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
                    await db.SaveChangesAsync();

                    var studentRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Student");
                    var parentRole  = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Parent");

                    if (studentRole != null && parentRole != null && !string.IsNullOrEmpty(newStudent.Email))
                    {
                        var (studentUser, parentUser, _, _, _) =
                            StudentAccountHelper.CreateAccounts(newStudent, studentRole, parentRole);
                        db.Users.AddRange(studentUser, parentUser);
                    }

                    await db.SaveChangesAsync();

                    await auditLogger.LogActionAsync(
                        userId: "SYSTEM_ROBOT",
                        role: "ADMIN",
                        actionInformation: $"Robotul a generat elevul: {newStudent.LastName} {newStudent.FirstName} și conturile sale."
                    );

                    await _hubContext.Clients.All.SendAsync("NewStudentAdded");
                }
                await Task.Delay(3000, stoppingToken);
            }
        }
    }
}