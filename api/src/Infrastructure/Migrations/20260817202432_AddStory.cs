using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 14, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    EpicId = table.Column<int>(type: "INTEGER", nullable: false),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    AssigneeId = table.Column<int>(type: "INTEGER", nullable: true),
                    CriteriaTotal = table.Column<int>(type: "INTEGER", nullable: false),
                    CriteriaDone = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stories_Epics_EpicId",
                        column: x => x.EpicId,
                        principalTable: "Epics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Stories_Users_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Stories",
                columns: new[] { "Id", "AssigneeId", "Code", "CriteriaDone", "CriteriaTotal", "Description", "EpicId", "Points", "Priority", "Status", "Title" },
                values: new object[,]
                {
                    { 1, 1, "STORY-2F8K3M9Q", 3, 3, null, 1, 5, 2, 2, "Inicio de sesión con email y contraseña" },
                    { 2, 4, "STORY-7H4N2P6R", 1, 3, null, 1, 3, 1, 1, "Recuperación de contraseña por email" },
                    { 3, 2, "STORY-9D5Q8T3W", 0, 4, null, 2, 8, 1, 0, "Columnas configurables en el tablero" },
                    { 4, null, "STORY-3K7V2X5Z", 0, 2, null, 2, 8, 2, 0, "Arrastrar y soltar tarjetas entre columnas" },
                    { 5, 3, "STORY-5M9R4H2N", 2, 3, null, 3, 5, 2, 1, "Planificación de sprint con capacidad del equipo" },
                    { 6, 3, "STORY-8P2W6D4K", 0, 2, null, 3, 5, 1, 0, "Cierre de sprint con reporte de velocity" },
                    { 7, 4, "STORY-4T6Z9M3V", 1, 3, null, 4, 3, 3, 1, "Alta de historias con estimación en puntos" },
                    { 8, 2, "STORY-6X3H8P5Q", 0, 2, null, 4, 2, 1, 0, "Filtro de historias por responsable y prioridad" },
                    { 9, 4, "STORY-2N7K4V9M", 2, 2, null, 8, 2, 0, 2, "Persistencia de preferencia de tema claro/oscuro" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stories_AssigneeId",
                table: "Stories",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_Code",
                table: "Stories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stories_EpicId",
                table: "Stories",
                column: "EpicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stories");
        }
    }
}
