using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceStoryWithTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stories");

            migrationBuilder.CreateTable(
                name: "Tickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 13, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    EpicId = table.Column<int>(type: "INTEGER", nullable: false),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    AssigneeId = table.Column<int>(type: "INTEGER", nullable: true),
                    ReporterId = table.Column<int>(type: "INTEGER", nullable: true),
                    SprintId = table.Column<int>(type: "INTEGER", nullable: true),
                    ParentId = table.Column<int>(type: "INTEGER", nullable: true),
                    ExtraFields = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tickets_Epics_EpicId",
                        column: x => x.EpicId,
                        principalTable: "Epics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tickets_Sprints_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tickets_Tickets_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tickets_Users_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tickets_Users_ReporterId",
                        column: x => x.ReporterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Tickets",
                columns: new[] { "Id", "AssigneeId", "Code", "CreatedAt", "Description", "EpicId", "ExtraFields", "ParentId", "Points", "Priority", "ReporterId", "SprintId", "Status", "Title", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, "UH-2F8K3M9Q", new DateTimeOffset(new DateTime(2026, 7, 22, 9, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 1, "{\"acceptanceCriteria\":[{\"text\":\"Las credenciales válidas devuelven un token\",\"done\":true},{\"text\":\"Las credenciales inválidas devuelven 401\",\"done\":true},{\"text\":\"El token expira a las 8 horas\",\"done\":true}],\"definitionOfReady\":[{\"text\":\"Diseño del formulario aprobado\",\"done\":true}],\"definitionOfDone\":[{\"text\":\"Probado en Postman\",\"done\":true}]}", null, 5, 2, 2, 1, 5, "Inicio de sesión con email y contraseña", 0, new DateTimeOffset(new DateTime(2026, 8, 5, 17, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, 4, "UH-9D5Q8T3W", new DateTimeOffset(new DateTime(2026, 8, 5, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 1, "{\"acceptanceCriteria\":[{\"text\":\"El enlace caduca a la hora\",\"done\":true},{\"text\":\"Un email inexistente no revela que no existe\",\"done\":false},{\"text\":\"El enlace solo puede usarse una vez\",\"done\":false}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 3, 1, 2, 2, 3, "Recuperación de contraseña por email", 0, new DateTimeOffset(new DateTime(2026, 8, 12, 11, 20, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, 2, "UH-3K7V2X5Z", new DateTimeOffset(new DateTime(2026, 8, 6, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 2, "{\"acceptanceCriteria\":[{\"text\":\"Se puede agregar una columna\",\"done\":false},{\"text\":\"Se puede renombrar una columna\",\"done\":false},{\"text\":\"Se puede reordenar una columna\",\"done\":false},{\"text\":\"No se puede borrar una columna con tickets\",\"done\":false}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 8, 1, 2, null, 0, "Columnas configurables en el tablero", 0, new DateTimeOffset(new DateTime(2026, 8, 6, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, 3, "UH-5M9R4H2N", new DateTimeOffset(new DateTime(2026, 8, 5, 9, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 3, "{\"acceptanceCriteria\":[{\"text\":\"La capacidad se carga por sprint\",\"done\":true},{\"text\":\"Se avisa cuando los puntos la superan\",\"done\":true},{\"text\":\"El aviso no bloquea la planificación\",\"done\":false}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 5, 2, 3, 2, 2, "Planificación de sprint con capacidad del equipo", 0, new DateTimeOffset(new DateTime(2026, 8, 14, 16, 45, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, 3, "BUG-8P2W6D4K", new DateTimeOffset(new DateTime(2026, 8, 11, 8, 45, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "La curva queda plana aunque el trabajo se haya terminado.", 3, "{\"severity\":\"major\",\"stepsToReproduce\":\"1. Cerrar un ticket que está en el backlog.\\n2. Abrir el burndown del sprint activo.\",\"expectedResult\":\"La curva baja por los puntos cerrados.\",\"actualResult\":\"La curva queda plana.\",\"environment\":\"Local, SQLite\"}", null, 2, 3, 2, 2, 2, "El burndown no descuenta los tickets cerrados fuera del sprint", 2, new DateTimeOffset(new DateTime(2026, 8, 13, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, 2, "TASK-6X3H8P5Q", new DateTimeOffset(new DateTime(2026, 8, 7, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 4, "{\"checklist\":[{\"text\":\"Filtro por responsable\",\"done\":false},{\"text\":\"Filtro por prioridad\",\"done\":false}]}", null, 2, 1, 4, null, 1, "Filtro de tickets por responsable y prioridad", 1, new DateTimeOffset(new DateTime(2026, 8, 7, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, 4, "UH-2N7K4V9M", new DateTimeOffset(new DateTime(2026, 7, 23, 13, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 8, "{\"acceptanceCriteria\":[{\"text\":\"La preferencia sobrevive a recargar la página\",\"done\":true},{\"text\":\"Sin preferencia guardada se usa la del sistema\",\"done\":true}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 2, 0, 1, 1, 5, "Persistencia de preferencia de tema claro/oscuro", 0, new DateTimeOffset(new DateTime(2026, 8, 4, 9, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, 2, "TASK-9J4R7B2X", new DateTimeOffset(new DateTime(2026, 8, 8, 9, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Se descartó: la librería actual ya cubre el caso.", 2, "{\"checklist\":[]}", null, 3, 0, 2, 2, 6, "Migrar el tablero a drag & drop nativo", 1, new DateTimeOffset(new DateTime(2026, 8, 15, 15, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, 1, "TASK-7H4N2P6R", new DateTimeOffset(new DateTime(2026, 7, 22, 9, 15, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Validar credenciales contra el hash BCrypt y firmar el JWT.", 1, "{\"checklist\":[{\"text\":\"Verificar el hash con BCrypt\",\"done\":true},{\"text\":\"Firmar el token con HMAC-SHA256\",\"done\":true}]}", 1, 0, 2, 1, 1, 5, "Endpoint POST /api/auth/login", 1, new DateTimeOffset(new DateTime(2026, 8, 4, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, 3, "FIX-4T6Z9M3V", new DateTimeOffset(new DateTime(2026, 8, 13, 10, 5, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 3, "{\"rootCause\":\"El cálculo cachea los puntos al abrir el sprint y no vuelve a leerlos.\",\"solution\":\"Recalcular al vuelo a partir de los tickets del sprint.\",\"verificationSteps\":[{\"text\":\"Mover un ticket cerrado al backlog y ver bajar la curva\",\"done\":false},{\"text\":\"Reabrir un ticket y ver subir la curva\",\"done\":false}],\"regressionRisk\":\"medium\"}", 6, 1, 3, 3, 2, 4, "Recalcular el burndown al mover un ticket de sprint", 3, new DateTimeOffset(new DateTime(2026, 8, 13, 10, 5, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_AssigneeId",
                table: "Tickets",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_Code",
                table: "Tickets",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_EpicId",
                table: "Tickets",
                column: "EpicId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ParentId",
                table: "Tickets",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ReporterId",
                table: "Tickets",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_SprintId",
                table: "Tickets",
                column: "SprintId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tickets");

            migrationBuilder.CreateTable(
                name: "Stories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AssigneeId = table.Column<int>(type: "INTEGER", nullable: true),
                    EpicId = table.Column<int>(type: "INTEGER", nullable: false),
                    SprintId = table.Column<int>(type: "INTEGER", nullable: true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 14, nullable: false),
                    CriteriaDone = table.Column<int>(type: "INTEGER", nullable: false),
                    CriteriaTotal = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false)
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
                        name: "FK_Stories_Sprints_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Stories_Users_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Stories",
                columns: new[] { "Id", "AssigneeId", "Code", "CriteriaDone", "CriteriaTotal", "Description", "EpicId", "Points", "Priority", "SprintId", "Status", "Title" },
                values: new object[,]
                {
                    { 1, 1, "STORY-2F8K3M9Q", 3, 3, null, 1, 5, 2, 1, 2, "Inicio de sesión con email y contraseña" },
                    { 2, 4, "STORY-7H4N2P6R", 1, 3, null, 1, 3, 1, 2, 1, "Recuperación de contraseña por email" },
                    { 3, 2, "STORY-9D5Q8T3W", 0, 4, null, 2, 8, 1, null, 0, "Columnas configurables en el tablero" },
                    { 4, null, "STORY-3K7V2X5Z", 0, 2, null, 2, 8, 2, 3, 0, "Arrastrar y soltar tarjetas entre columnas" },
                    { 5, 3, "STORY-5M9R4H2N", 2, 3, null, 3, 5, 2, 2, 1, "Planificación de sprint con capacidad del equipo" },
                    { 6, 3, "STORY-8P2W6D4K", 0, 2, null, 3, 5, 1, 3, 0, "Cierre de sprint con reporte de velocity" },
                    { 7, 4, "STORY-4T6Z9M3V", 1, 3, null, 4, 3, 3, 2, 1, "Alta de historias con estimación en puntos" },
                    { 8, 2, "STORY-6X3H8P5Q", 0, 2, null, 4, 2, 1, null, 0, "Filtro de historias por responsable y prioridad" },
                    { 9, 4, "STORY-2N7K4V9M", 2, 2, null, 8, 2, 0, 1, 2, "Persistencia de preferencia de tema claro/oscuro" }
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

            migrationBuilder.CreateIndex(
                name: "IX_Stories_SprintId",
                table: "Stories",
                column: "SprintId");
        }
    }
}
