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
        public DbSet<Badge> Badges { get; set; }
        public DbSet<TeacherProfile> TeacherProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TeacherProfile>()
                .HasIndex(tp => tp.UserId)
                .IsUnique();
        }
    }
}