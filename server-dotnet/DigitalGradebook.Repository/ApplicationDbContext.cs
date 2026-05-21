using DigitalGradebook.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigitalGradebook.Repository
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }
        public DbSet<Grade> Grades { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<DigitalGradebook.Domain.Entities.LogEntry> Logs { get; set; }
        public DbSet<DigitalGradebook.Domain.Entities.SuspiciousUser> SuspiciousUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Inserăm elevii (exact cum îi aveai)
            modelBuilder.Entity<Student>().HasData(
                new Student { Id = 1, LastName = "Popa", FirstName = "Maria", Email = "maria.p@student.com", BirthDate = "10/10/2015", Cnp = "6150512410011", Username = "MariaP2015", UniqueNumber = "7Y148510", ParentDad = "Popa Viorel", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Popa Elena", Mentions = "A very diligent student with great attention to detail." },
                new Student { Id = 2, LastName = "Ionescu", FirstName = "Maia", Email = "maia.i@student.com", BirthDate = "10/10/2015", Cnp = "6150823410022", Username = "MaiaI", UniqueNumber = "7Y148511", ParentDad = "Ionescu Dan", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Ionescu Carmen", Mentions = "Maia is making rapid progress in mathematics." },
                new Student { Id = 3, LastName = "Szabo", FirstName = "Eduard", Email = "eduard.s@student.com", BirthDate = "10/10/2015", Cnp = "5160205410033", Username = "EdiSz", UniqueNumber = "7Y148512", ParentDad = "Szabo Levente", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Szabo Ionela", Mentions = "Eduard needs to focus more on his reading skills." },
                new Student { Id = 4, LastName = "Pop", FirstName = "Tiberiu", Email = "tiberiu.p@student.com", BirthDate = "10/10/2015", Cnp = "5151114410044", Username = "TibiP", UniqueNumber = "7Y148513", ParentDad = "Pop Ovidiu", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Pop Maria", Mentions = "Tiberiu requires additional support with his writing." },
                new Student { Id = 5, LastName = "Negru", FirstName = "Denisa", Email = "denisa.n@student.com", BirthDate = "10/10/2015", Cnp = "6160329410055", Username = "DeniN", UniqueNumber = "7Y148514", ParentDad = "Negru Marin", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Negru Adina", Mentions = "A bright presence in the classroom and very active." },
                new Student { Id = 6, LastName = "Dumbravean", FirstName = "Ionela", Email = "ionela.d@student.com", BirthDate = "10/10/2015", Cnp = "6150701410066", Username = "IonelaD", UniqueNumber = "7Y148515", ParentDad = "Dumbravean Ioan", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Dumbravean Ana", Mentions = "Ionela draws beautifully during breaks." },
                new Student { Id = 7, LastName = "Vasilescu", FirstName = "Andrei", Email = "andrei.v@student.com", BirthDate = "10/10/2015", Cnp = "5150918410077", Username = "AndreiV", UniqueNumber = "7Y148516", ParentDad = "Vasilescu George", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Vasilescu Mirela", Mentions = "Andrei has started to participate more during lessons." },
                new Student { Id = 8, LastName = "Munteanu", FirstName = "Alina", Email = "alina.m@student.com", BirthDate = "10/10/2015", Cnp = "6151010410088", Username = "AlinaM", UniqueNumber = "7Y148517", ParentDad = "Munteanu Paul", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Munteanu Silvia", Mentions = "Alina is the leader of the project team." },
                new Student { Id = 9, LastName = "Radu", FirstName = "Florin", Email = "florin.r@student.com", BirthDate = "10/10/2015", Cnp = "5160122410099", Username = "FlorinR", UniqueNumber = "7Y148518", ParentDad = "Radu Cristian", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Radu Ioana", Mentions = "Florin's efforts are clearly visible in history class." },
                new Student { Id = 10, LastName = "Georgescu", FirstName = "Ana", Email = "ana.g@student.com", BirthDate = "10/10/2015", Cnp = "6160415410100", Username = "AnaGeo", UniqueNumber = "7Y148519", ParentDad = "Georgescu Mihai", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Georgescu Dana", Mentions = "Ana excels in all subjects this semester." },
                new Student { Id = 11, LastName = "Stanescu", FirstName = "Bogdan", Email = "bogdan.s@student.com", BirthDate = "10/10/2015", Cnp = "5151203410111", Username = "BogdanS", UniqueNumber = "7Y148520", ParentDad = "Stanescu Alex", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Stanescu Raluca", Mentions = "Bogdan is a very fair and reliable teammate." },
                new Student { Id = 12, LastName = "Dumitrescu", FirstName = "Elena", Email = "elena.d@student.com", BirthDate = "10/10/2015", Cnp = "6150619410122", Username = "ElenaD", UniqueNumber = "7Y148521", ParentDad = "Dumitrescu Lucian", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Dumitrescu Vera", Mentions = "Elena has a very rich vocabulary for her age." },
                new Student { Id = 13, LastName = "Popescu", FirstName = "Radu", Email = "radu.p@student.com", BirthDate = "10/10/2015", Cnp = "5160227410133", Username = "RaduP", UniqueNumber = "7Y148522", ParentDad = "Popescu Matei", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Popescu Laura", Mentions = "Radu needs to practice the multiplication table more often." },
                new Student { Id = 14, LastName = "Ionescu", FirstName = "Andreea", Email = "andreea.i@student.com", BirthDate = "10/10/2015", Cnp = "6150511410144", Username = "AndreeaI", UniqueNumber = "7Y148523", ParentDad = "Ionescu Radu", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Ionescu Gina", Mentions = "Andreea is shy, but she is making wonderful progress." },
                new Student { Id = 15, LastName = "Vasilescu", FirstName = "Ioana", Email = "ioana.v@student.com", BirthDate = "10/10/2015", Cnp = "6150830410155", Username = "IoanaV", UniqueNumber = "7Y148524", ParentDad = "Vasilescu Sorin", PhoneDad = "0712345678", PhoneMom = "0712345678", ParentMom = "Vasilescu Monica", Mentions = "Ioana is very creative during music lessons." }
            );

            // 2. Generăm note random pentru fiecare elev (între 2 și 4 note pe materie)
            var grades = new List<Grade>();
            var subjects = new[] { "Math", "Romanian", "English", "Biology", "Physical Education", "Visual Arts", "Informatics", "History" };
            var possibleGrades = new[] { "FB", "FB", "B", "B", "S", "I" }; // Am pus mai multe FB și B ca să aibă medii bune
            var random = new Random(42);
            int gradeId = 1;

            for (int studentId = 1; studentId <= 15; studentId++)
            {
                foreach (var subject in subjects)
                {
                    int numberOfGrades = random.Next(2, 5); // Fiecare copil are 2, 3 sau 4 note la o materie
                    for (int i = 0; i < numberOfGrades; i++)
                    {
                        grades.Add(new Grade
                        {
                            Id = gradeId++,
                            StudentId = studentId,
                            SubjectName = subject,
                            Value = possibleGrades[random.Next(possibleGrades.Length)]
                        });
                    }
                }
            }

            modelBuilder.Entity<Grade>().HasData(grades);
        }
    }
}