using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false, collation: "NOCASE"),
                    Password = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Epics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 13, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    AccentColor = table.Column<int>(type: "INTEGER", nullable: true),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    OwnerId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Epics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Epics_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Name", "Password" },
                values: new object[,]
                {
                    { 1, "juan@req2ticket.com", "Juan Cruz", "Passw0rd!" },
                    { 2, "camila@req2ticket.com", "Camila Rossi", "Camila#25" },
                    { 3, "martin@req2ticket.com", "Martín Díaz", "Martin$77" },
                    { 4, "sofia@req2ticket.com", "Sofía Vega", "Sofia*9x1" }
                });

            migrationBuilder.InsertData(
                table: "Epics",
                columns: new[] { "Id", "AccentColor", "Code", "Description", "Name", "OwnerId", "Priority", "Status" },
                values: new object[,]
                {
                    { 1, 0, "EPIC-7F3A2B9K", "Login, registro y recuperación de contraseña.", "Autenticación", 1, 2, 1 },
                    { 2, 1, "EPIC-M4XQ8T2V", "Columnas configurables y drag & drop.", "Tablero Kanban", 2, 1, 0 },
                    { 3, 2, "EPIC-9DZP5R3W", "Planificación, capacidad del equipo y cierre de sprint.", "Gestión de sprints", 3, 2, 1 },
                    { 4, 3, "EPIC-2H6NKY4S", "Alta, edición y estimación en puntos.", "Historias de usuario", 4, 3, 1 },
                    { 5, 4, "EPIC-QB8V3JM7", "Velocity, burndown y lead time por equipo.", "Panel de métricas", 1, 1, 0 },
                    { 6, 5, "EPIC-5T9WGX2A", "Avisos por email y centro de notificaciones in-app.", "Notificaciones", 2, 0, 0 },
                    { 7, 7, "EPIC-3RJ7C4ZP", "Carga de documentos y extracción automática de tickets.", "Importador de requerimientos", 3, 3, 1 },
                    { 8, 9, "EPIC-K2M5NQ8D", "Tema claro/oscuro con preferencia persistida.", "Modo oscuro", 4, 0, 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Epics_Code",
                table: "Epics",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Epics_OwnerId",
                table: "Epics",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Epics");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
