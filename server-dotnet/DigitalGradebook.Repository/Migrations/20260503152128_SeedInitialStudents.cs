using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DigitalGradebook.Repository.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialStudents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Students",
                columns: new[] { "Id", "BirthDate", "Cnp", "Email", "FirstName", "LastName", "Mentions", "ParentDad", "ParentMom", "PhoneDad", "PhoneMom", "UniqueNumber", "Username" },
                values: new object[,]
                {
                    { 1, "2015-05-12", "6150512410011", "maria.p@student.ro", "Maria", "Popa", "A very diligent student with great attention to detail.", "Popa Viorel", "Popa Elena", "", "", "7Y148510", "MariaP2015" },
                    { 2, "2015-08-23", "6150823410022", "maia.i@student.ro", "Maia", "Ionescu", "Maia is making rapid progress in mathematics.", "Ionescu Dan", "Ionescu Carmen", "", "", "7Y148511", "MaiaI" },
                    { 3, "2016-02-05", "5160205410033", "eduard.s@student.ro", "Eduard", "Szabo", "Eduard needs to focus more on his reading skills.", "Szabo Levente", "Szabo Ionela", "", "", "7Y148512", "EdiSz" },
                    { 4, "2015-11-14", "5151114410044", "tiberiu.p@student.ro", "Tiberiu", "Pop", "Tiberiu requires additional support with his writing.", "Pop Ovidiu", "Pop Maria", "", "", "7Y148513", "TibiP" },
                    { 5, "2016-03-29", "6160329410055", "denisa.n@student.ro", "Denisa", "Negru", "A bright presence in the classroom and very active.", "Negru Marin", "Negru Adina", "", "", "7Y148514", "DeniN" },
                    { 6, "2015-07-01", "6150701410066", "ionela.d@student.ro", "Ionela", "Dumbravean", "Ionela draws beautifully during breaks.", "Dumbravean Ioan", "Dumbravean Ana", "", "", "7Y148515", "IonelaD" },
                    { 7, "2015-09-18", "5150918410077", "andrei.v@student.ro", "Andrei", "Vasilescu", "Andrei has started to participate more during lessons.", "Vasilescu George", "Vasilescu Mirela", "", "", "7Y148516", "AndreiV" },
                    { 8, "2015-10-10", "6151010410088", "alina.m@student.ro", "Alina", "Munteanu", "Alina is the leader of the project team.", "Munteanu Paul", "Munteanu Silvia", "", "", "7Y148517", "AlinaM" },
                    { 9, "2016-01-22", "5160122410099", "florin.r@student.ro", "Florin", "Radu", "Florin's efforts are clearly visible in history class.", "Radu Cristian", "Radu Ioana", "", "", "7Y148518", "FlorinR" },
                    { 10, "2016-04-15", "6160415410100", "ana.g@student.ro", "Ana", "Georgescu", "Ana excels in all subjects this semester.", "Georgescu Mihai", "Georgescu Dana", "", "", "7Y148519", "AnaGeo" },
                    { 11, "2015-12-03", "5151203410111", "bogdan.s@student.ro", "Bogdan", "Stanescu", "Bogdan is a very fair and reliable teammate.", "Stanescu Alex", "Stanescu Raluca", "", "", "7Y148520", "BogdanS" },
                    { 12, "2015-06-19", "6150619410122", "elena.d@student.ro", "Elena", "Dumitrescu", "Elena has a very rich vocabulary for her age.", "Dumitrescu Lucian", "Dumitrescu Vera", "", "", "7Y148521", "ElenaD" },
                    { 13, "2016-02-27", "5160227410133", "radu.p@student.ro", "Radu", "Popescu", "Radu needs to practice the multiplication table more often.", "Popescu Matei", "Popescu Laura", "", "", "7Y148522", "RaduP" },
                    { 14, "2015-05-11", "6150511410144", "andreea.i@student.ro", "Andreea", "Ionescu", "Andreea is shy, but she is making wonderful progress.", "Ionescu Radu", "Ionescu Gina", "", "", "7Y148523", "AndreeaI" },
                    { 15, "2015-08-30", "6150830410155", "ioana.v@student.ro", "Ioana", "Vasilescu", "Ioana is very creative during music lessons.", "Vasilescu Sorin", "Vasilescu Monica", "", "", "7Y148524", "IoanaV" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Students",
                keyColumn: "Id",
                keyValue: 15);
        }
    }
}
