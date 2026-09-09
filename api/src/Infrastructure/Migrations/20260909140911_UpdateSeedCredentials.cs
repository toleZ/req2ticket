using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeedCredentials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "Name" },
                values: new object[] { "admin@req2ticket.com", "Admin" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Email", "Name", "PasswordHash" },
                values: new object[] { "productowner@req2ticket.com", "Product Owner", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "Name", "PasswordHash" },
                values: new object[] { "scrummaster@req2ticket.com", "Scrum Master", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Email", "Name", "PasswordHash" },
                values: new object[] { "developer@req2ticket.com", "Developer", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "superadmin@req2ticket.com", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "Name" },
                values: new object[] { "juan@req2ticket.com", "Juan Cruz" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Email", "Name", "PasswordHash" },
                values: new object[] { "camila@req2ticket.com", "Camila Rossi", "$2a$11$9JK.29wC/YYDMPrx/17SzuQXEnij2SgPTrAAVOfG6BWtoBwgtOA5e" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "Name", "PasswordHash" },
                values: new object[] { "martin@req2ticket.com", "Martín Díaz", "$2a$11$5YLkOMjlsgsrGOqYxhb8s.0V9wC7UKQOn3zrHRH5SZh4oMMIOdt/S" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Email", "Name", "PasswordHash" },
                values: new object[] { "sofia@req2ticket.com", "Sofía Vega", "$2a$11$LtN.MT4Q48L1DP4qVhzCK.FpO09sg2QRWHfkiFpJxBHqQM21ftqGS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "super@req2ticket.com", "$2a$11$fkAugXmXGHzCughLu.qRbOdUqu2RwMo53qyrsSgYum/LE1lDIaECq" });
        }
    }
}
