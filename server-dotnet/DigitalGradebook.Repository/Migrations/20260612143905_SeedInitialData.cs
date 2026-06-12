using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalGradebook.Repository.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO ""Permissions"" (""Name"") VALUES ('FULL_PERMISSIONS') ON CONFLICT DO NOTHING;
INSERT INTO ""Permissions"" (""Name"") VALUES ('RESTRICTED_PERMISSIONS') ON CONFLICT DO NOTHING;
");

            migrationBuilder.Sql(@"
INSERT INTO ""Roles"" (""Name"") VALUES ('Teacher') ON CONFLICT DO NOTHING;
INSERT INTO ""Roles"" (""Name"") VALUES ('Student') ON CONFLICT DO NOTHING;
INSERT INTO ""Roles"" (""Name"") VALUES ('Parent') ON CONFLICT DO NOTHING;
INSERT INTO ""Roles"" (""Name"") VALUES ('Admin') ON CONFLICT DO NOTHING;
");

            migrationBuilder.Sql(@"
INSERT INTO ""Users"" (""Username"", ""PasswordHash"", ""RoleId"", ""SecurityPinHash"")
SELECT 'admin', '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', r.""Id"", '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
FROM ""Roles"" r WHERE r.""Name"" = 'Teacher'
ON CONFLICT DO NOTHING;
");

            migrationBuilder.Sql(@"
INSERT INTO ""Users"" (""Username"", ""PasswordHash"", ""RoleId"", ""SecurityPinHash"")
SELECT 'superadmin', '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', r.""Id"", '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
FROM ""Roles"" r WHERE r.""Name"" = 'Admin'
ON CONFLICT DO NOTHING;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
