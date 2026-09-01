using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

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
                name: "Sprints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Goal = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Email = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Epics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AccentColor = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    OwnerId = table.Column<int>(type: "integer", nullable: true)
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

            migrationBuilder.CreateTable(
                name: "Tickets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EpicId = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    AssigneeId = table.Column<int>(type: "integer", nullable: true),
                    ReporterId = table.Column<int>(type: "integer", nullable: true),
                    SprintId = table.Column<int>(type: "integer", nullable: true),
                    ParentId = table.Column<int>(type: "integer", nullable: true),
                    ExtraFields = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
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
                table: "Sprints",
                columns: new[] { "Id", "Capacity", "EndDate", "Goal", "Name", "StartDate", "Status" },
                values: new object[,]
                {
                    { 1, 13, new DateOnly(2026, 8, 5), "Cerrar el bloque de autenticación y dejar el listado de facturas en producción.", "Sprint 6", new DateOnly(2026, 7, 22), 2 },
                    { 2, 34, new DateOnly(2026, 8, 19), "Segundo factor operativo y centro de incidencias abierto a los primeros clientes.", "Sprint 7", new DateOnly(2026, 8, 5), 1 },
                    { 3, 30, new DateOnly(2026, 9, 2), "Pagos con tarjeta y panel de administración de cuentas.", "Sprint 8", new DateOnly(2026, 8, 19), 0 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "juan@req2ticket.com", "Juan Cruz", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6", 5 },
                    { 2, "camila@req2ticket.com", "Camila Rossi", "$2a$11$9JK.29wC/YYDMPrx/17SzuQXEnij2SgPTrAAVOfG6BWtoBwgtOA5e", 4 },
                    { 3, "martin@req2ticket.com", "Martín Díaz", "$2a$11$5YLkOMjlsgsrGOqYxhb8s.0V9wC7UKQOn3zrHRH5SZh4oMMIOdt/S", 3 },
                    { 4, "sofia@req2ticket.com", "Sofía Vega", "$2a$11$LtN.MT4Q48L1DP4qVhzCK.FpO09sg2QRWHfkiFpJxBHqQM21ftqGS", 2 },
                    { 5, "super@req2ticket.com", "Super Admin", "$2a$11$fkAugXmXGHzCughLu.qRbOdUqu2RwMo53qyrsSgYum/LE1lDIaECq", 6 }
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

            migrationBuilder.InsertData(
                table: "Tickets",
                columns: new[] { "Id", "AssigneeId", "Code", "CreatedAt", "Description", "EpicId", "ExtraFields", "ParentId", "Points", "Priority", "ReporterId", "SprintId", "Status", "Title", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, "UH-2F8K3M9Q", new DateTimeOffset(new DateTime(2026, 7, 22, 9, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 1, "{\"acceptanceCriteria\":[{\"text\":\"Las credenciales válidas devuelven un token\",\"done\":true},{\"text\":\"Las credenciales inválidas devuelven 401\",\"done\":true},{\"text\":\"El token expira a las 8 horas\",\"done\":true}],\"definitionOfReady\":[{\"text\":\"Diseño del formulario aprobado\",\"done\":true}],\"definitionOfDone\":[{\"text\":\"Probado en Postman\",\"done\":true}]}", null, 5, 2, 2, 1, 5, "Inicio de sesión con email y contraseña", 0, new DateTimeOffset(new DateTime(2026, 8, 5, 17, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 3, 4, "UH-9D5Q8T3W", new DateTimeOffset(new DateTime(2026, 8, 5, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 1, "{\"acceptanceCriteria\":[{\"text\":\"El enlace caduca a la hora\",\"done\":true},{\"text\":\"Un email inexistente no revela que no existe\",\"done\":false},{\"text\":\"El enlace solo puede usarse una vez\",\"done\":false}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 3, 1, 2, 2, 3, "Recuperación de contraseña por email", 0, new DateTimeOffset(new DateTime(2026, 8, 12, 11, 20, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 4, 2, "UH-3K7V2X5Z", new DateTimeOffset(new DateTime(2026, 8, 6, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 2, "{\"acceptanceCriteria\":[{\"text\":\"Se puede agregar una columna\",\"done\":false},{\"text\":\"Se puede renombrar una columna\",\"done\":false},{\"text\":\"Se puede reordenar una columna\",\"done\":false},{\"text\":\"No se puede borrar una columna con tickets\",\"done\":false}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 8, 1, 2, null, 0, "Columnas configurables en el tablero", 0, new DateTimeOffset(new DateTime(2026, 8, 6, 14, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 5, 3, "UH-5M9R4H2N", new DateTimeOffset(new DateTime(2026, 8, 5, 9, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 3, "{\"acceptanceCriteria\":[{\"text\":\"La capacidad se carga por sprint\",\"done\":true},{\"text\":\"Se avisa cuando los puntos la superan\",\"done\":true},{\"text\":\"El aviso no bloquea la planificación\",\"done\":false}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 5, 2, 3, 2, 2, "Planificación de sprint con capacidad del equipo", 0, new DateTimeOffset(new DateTime(2026, 8, 14, 16, 45, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 6, 3, "BUG-8P2W6D4K", new DateTimeOffset(new DateTime(2026, 8, 11, 8, 45, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "La curva queda plana aunque el trabajo se haya terminado.", 3, "{\"severity\":\"major\",\"stepsToReproduce\":\"1. Cerrar un ticket que está en el backlog.\\n2. Abrir el burndown del sprint activo.\",\"expectedResult\":\"La curva baja por los puntos cerrados.\",\"actualResult\":\"La curva queda plana.\",\"environment\":\"Local, PostgreSQL\"}", null, 2, 3, 2, 2, 2, "El burndown no descuenta los tickets cerrados fuera del sprint", 2, new DateTimeOffset(new DateTime(2026, 8, 13, 10, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 8, 2, "TASK-6X3H8P5Q", new DateTimeOffset(new DateTime(2026, 8, 7, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 4, "{\"checklist\":[{\"text\":\"Filtro por responsable\",\"done\":false},{\"text\":\"Filtro por prioridad\",\"done\":false}]}", null, 2, 1, 4, null, 1, "Filtro de tickets por responsable y prioridad", 1, new DateTimeOffset(new DateTime(2026, 8, 7, 11, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 9, 4, "UH-2N7K4V9M", new DateTimeOffset(new DateTime(2026, 7, 23, 13, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 8, "{\"acceptanceCriteria\":[{\"text\":\"La preferencia sobrevive a recargar la página\",\"done\":true},{\"text\":\"Sin preferencia guardada se usa la del sistema\",\"done\":true}],\"definitionOfReady\":[],\"definitionOfDone\":[]}", null, 2, 0, 1, 1, 5, "Persistencia de preferencia de tema claro/oscuro", 0, new DateTimeOffset(new DateTime(2026, 8, 4, 9, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 10, 2, "TASK-9J4R7B2X", new DateTimeOffset(new DateTime(2026, 8, 8, 9, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Se descartó: la librería actual ya cubre el caso.", 2, "{\"checklist\":[]}", null, 3, 0, 2, 2, 6, "Migrar el tablero a drag & drop nativo", 1, new DateTimeOffset(new DateTime(2026, 8, 15, 15, 30, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, 1, "TASK-7H4N2P6R", new DateTimeOffset(new DateTime(2026, 7, 22, 9, 15, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Validar credenciales contra el hash BCrypt y firmar el JWT.", 1, "{\"checklist\":[{\"text\":\"Verificar el hash con BCrypt\",\"done\":true},{\"text\":\"Firmar el token con HMAC-SHA256\",\"done\":true}]}", 1, 0, 2, 1, 1, 5, "Endpoint POST /api/auth/login", 1, new DateTimeOffset(new DateTime(2026, 8, 4, 12, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 7, 3, "FIX-4T6Z9M3V", new DateTimeOffset(new DateTime(2026, 8, 13, 10, 5, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null, 3, "{\"rootCause\":\"El cálculo cachea los puntos al abrir el sprint y no vuelve a leerlos.\",\"solution\":\"Recalcular al vuelo a partir de los tickets del sprint.\",\"verificationSteps\":[{\"text\":\"Mover un ticket cerrado al backlog y ver bajar la curva\",\"done\":false},{\"text\":\"Reabrir un ticket y ver subir la curva\",\"done\":false}],\"regressionRisk\":\"medium\"}", 6, 1, 3, 3, 2, 4, "Recalcular el burndown al mover un ticket de sprint", 3, new DateTimeOffset(new DateTime(2026, 8, 13, 10, 5, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)) }
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
                name: "Tickets");

            migrationBuilder.DropTable(
                name: "Epics");

            migrationBuilder.DropTable(
                name: "Sprints");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
