using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalGradebook.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UpdateConturi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "maria.p@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "maia.i@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "eduard.s@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "tiberiu.p@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "denisa.n@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "ionela.d@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "andrei.v@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "alina.m@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "florin.r@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "ana.g@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "bogdan.s@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "elena.d@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "radu.p@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "andreea.i@student.com", "0712345678", "0712345678" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "10/10/2015", "ioana.v@student.com", "0712345678", "0712345678" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-05-12", "maria.p@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-08-23", "maia.i@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2016-02-05", "eduard.s@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-11-14", "tiberiu.p@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2016-03-29", "denisa.n@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-07-01", "ionela.d@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-09-18", "andrei.v@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-10-10", "alina.m@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2016-01-22", "florin.r@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2016-04-15", "ana.g@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-12-03", "bogdan.s@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-06-19", "elena.d@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2016-02-27", "radu.p@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-05-11", "andreea.i@student.ro", "", "" });

            migrationBuilder.UpdateData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "BirthDate", "Email", "PhoneDad", "PhoneMom" },
                values: new object[] { "2015-08-30", "ioana.v@student.ro", "", "" });
        }
    }
}
