using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalGradebook.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSecurityPin_3FA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SecurityPin",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SecurityPin",
                table: "Users");
        }
    }
}
