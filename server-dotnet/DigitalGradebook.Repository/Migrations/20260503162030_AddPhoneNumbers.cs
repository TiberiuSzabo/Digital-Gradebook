using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalGradebook.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddPhoneNumbers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ParentDadPhone",
                table: "Students",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ParentMomPhone",
                table: "Students",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "ParentDadPhone", "ParentMomPhone" },
                values: new object[] { "", "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentDadPhone",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentMomPhone",
                table: "Students");
        }
    }
}
