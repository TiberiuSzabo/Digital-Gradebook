using DigitalGradebook.Domain.Entities;

namespace DigitalGradebook.WebApi
{
    public class GradeDto
    {
        public int Id { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class StudentDto
    {
        public int Id { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string BirthDate { get; set; } = string.Empty;
        public string Cnp { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string UniqueNumber { get; set; } = string.Empty;
        public string ParentDad { get; set; } = string.Empty;
        public string PhoneDad { get; set; } = string.Empty;
        public string ParentMom { get; set; } = string.Empty;
        public string PhoneMom { get; set; } = string.Empty;
        public string Mentions { get; set; } = string.Empty;
        public int? ClassYear { get; set; }
        public List<GradeDto> Grades { get; set; } = new();
    }

    public class StudentInputDto
    {
        public int Id { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string BirthDate { get; set; } = string.Empty;
        public string Cnp { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string UniqueNumber { get; set; } = string.Empty;
        public string ParentDad { get; set; } = string.Empty;
        public string PhoneDad { get; set; } = string.Empty;
        public string ParentMom { get; set; } = string.Empty;
        public string PhoneMom { get; set; } = string.Empty;
        public string Mentions { get; set; } = string.Empty;
    }

    public static class StudentMappingExtensions
    {
        public static StudentDto ToDto(this Student s) => new StudentDto
        {
            Id = s.Id,
            LastName = s.LastName,
            FirstName = s.FirstName,
            Email = s.Email,
            BirthDate = s.BirthDate,
            Cnp = s.Cnp,
            Username = s.Username,
            UniqueNumber = s.UniqueNumber,
            ParentDad = s.ParentDad,
            PhoneDad = s.PhoneDad,
            ParentMom = s.ParentMom,
            PhoneMom = s.PhoneMom,
            Mentions = s.Mentions,
            ClassYear = s.ClassYear,
            Grades = s.Grades.Select(g => new GradeDto
            {
                Id = g.Id,
                SubjectName = g.SubjectName,
                Value = g.Value
            }).ToList()
        };
    }
}
