using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSprint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sprints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Goal = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Capacity = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprints", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Sprints",
                columns: new[] { "Id", "Capacity", "EndDate", "Goal", "Name", "StartDate", "Status" },
                values: new object[,]
                {
                    { 1, 13, new DateOnly(2026, 8, 5), "Cerrar el bloque de autenticación y dejar el listado de facturas en producción.", "Sprint 6", new DateOnly(2026, 7, 22), 2 },
                    { 2, 34, new DateOnly(2026, 8, 19), "Segundo factor operativo y centro de incidencias abierto a los primeros clientes.", "Sprint 7", new DateOnly(2026, 8, 5), 1 },
                    { 3, 30, new DateOnly(2026, 9, 2), "Pagos con tarjeta y panel de administración de cuentas.", "Sprint 8", new DateOnly(2026, 8, 19), 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sprints");
        }
    }
}
