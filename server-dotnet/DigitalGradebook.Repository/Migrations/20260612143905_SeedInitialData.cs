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
            migrationBuilder.Sql(@"INSERT INTO ""Permissions"" (""Name"") VALUES ('FULL_PERMISSIONS');");
            migrationBuilder.Sql(@"INSERT INTO ""Permissions"" (""Name"") VALUES ('RESTRICTED_PERMISSIONS');");
            migrationBuilder.Sql(@"INSERT INTO ""Roles"" (""Name"") VALUES ('Teacher');");
            migrationBuilder.Sql(@"INSERT INTO ""Roles"" (""Name"") VALUES ('Student');");
            migrationBuilder.Sql(@"INSERT INTO ""Roles"" (""Name"") VALUES ('Parent');");
            migrationBuilder.Sql(@"INSERT INTO ""Roles"" (""Name"") VALUES ('Admin');");
            migrationBuilder.Sql(@"
INSERT INTO ""Users"" (""Username"", ""PasswordHash"", ""RoleId"", ""SecurityPinHash"")
SELECT 'admin', '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', ""Id"", '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
FROM ""Roles"" WHERE ""Name"" = 'Teacher';
");
            migrationBuilder.Sql(@"
INSERT INTO ""Users"" (""Username"", ""PasswordHash"", ""RoleId"", ""SecurityPinHash"")
SELECT 'superadmin', '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', ""Id"", '$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
FROM ""Roles"" WHERE ""Name"" = 'Admin';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
