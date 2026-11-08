using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProjectsWorkspaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Tickets_ParentId",
                table: "Tickets");

            /* Hand-edited (OPS-1, ENT-1). Every epic, sprint and ticket in an existing database is
               demo data from the old HasData seeds, and none of it fits the new model: it has no
               project, its codes are random, its statuses use the old numbering (backlog was 0) and
               its type fields live in ExtraFields. Emptying the tables is what ENT-1 agreed to; the
               DemoSeeder creates the demo again on the next start, through the services.

               TRUNCATE instead of the DeleteData EF generated row by row: it also empties anything
               created by hand, and RESTART IDENTITY starts the ids over. */
            migrationBuilder.Sql("TRUNCATE \"Tickets\", \"Sprints\", \"Epics\" RESTART IDENTITY CASCADE;");

            // The five seed users had a known password written in the code: they must not survive in
            // any database, prod included. Real accounts are kept.
            migrationBuilder.Sql("DELETE FROM \"Users\" WHERE \"Id\" IN (1, 2, 3, 4, 5) AND \"Email\" LIKE '%@req2ticket.com';");

            migrationBuilder.DropColumn(
                name: "ExtraFields",
                table: "Tickets");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Users",
                newName: "PlatformRole");

            // UserRole (viewer 0 … superAdmin 6) becomes PlatformRole (user 0, superAdmin 1). Roles
            // inside a project are memberships now; only SuperAdmin remains a platform role.
            migrationBuilder.Sql("UPDATE \"Users\" SET \"PlatformRole\" = CASE WHEN \"PlatformRole\" = 6 THEN 1 ELSE 0 END;");

            // HasData inserted users with explicit ids without moving the sequence forward. Point it
            // past the highest id left, so the next sign-up cannot collide.
            migrationBuilder.Sql(
                "SELECT setval(pg_get_serial_sequence('\"Users\"', 'Id'), COALESCE((SELECT MAX(\"Id\") FROM \"Users\"), 0) + 1, false);");

            migrationBuilder.RenameColumn(
                name: "Points",
                table: "Tickets",
                newName: "ProjectId");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Tickets",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(13)",
                oldMaxLength: 13);

            migrationBuilder.AddColumn<int>(
                name: "Number",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "Sprints",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Epics",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(13)",
                oldMaxLength: 13);

            migrationBuilder.AddColumn<int>(
                name: "Number",
                table: "Epics",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "Epics",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Bugs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    StepsToReproduce = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ExpectedResult = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ActualResult = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Environment = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bugs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bugs_Tickets_Id",
                        column: x => x.Id,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Fixes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    RootCause = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Solution = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RegressionRisk = table.Column<int>(type: "integer", nullable: false),
                    VerificationSteps = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fixes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Fixes_Tickets_Id",
                        column: x => x.Id,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ArchivedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    NextEpicNumber = table.Column<int>(type: "integer", nullable: false),
                    NextUserStoryNumber = table.Column<int>(type: "integer", nullable: false),
                    NextTaskNumber = table.Column<int>(type: "integer", nullable: false),
                    NextBugNumber = table.Column<int>(type: "integer", nullable: false),
                    NextFixNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: true),
                    Checklist = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Tickets_Id",
                        column: x => x.Id,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserStories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: true),
                    AcceptanceCriteria = table.Column<string>(type: "jsonb", nullable: false),
                    DefinitionOfReady = table.Column<string>(type: "jsonb", nullable: false),
                    DefinitionOfDone = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserStories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserStories_Tickets_Id",
                        column: x => x.Id,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectMembers",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMembers", x => new { x.ProjectId, x.UserId });
                    table.ForeignKey(
                        name: "FK_ProjectMembers_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Workflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Workflows_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowTransitions",
                columns: table => new
                {
                    WorkflowId = table.Column<int>(type: "integer", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowTransitions", x => new { x.WorkflowId, x.FromStatus, x.ToStatus });
                    table.CheckConstraint("CK_WorkflowTransitions_FromNotTo", "\"FromStatus\" <> \"ToStatus\"");
                    table.ForeignKey(
                        name: "FK_WorkflowTransitions_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ProjectId_Type_Number",
                table: "Tickets",
                columns: new[] { "ProjectId", "Type", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_OneActivePerProject",
                table: "Sprints",
                column: "ProjectId",
                unique: true,
                filter: "\"Status\" = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Epics_ProjectId_Number",
                table: "Epics",
                columns: new[] { "ProjectId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMembers_UserId",
                table: "ProjectMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Key",
                table: "Projects",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_ProjectId",
                table: "Workflows",
                column: "ProjectId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Epics_Projects_ProjectId",
                table: "Epics",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sprints_Projects_ProjectId",
                table: "Sprints",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Projects_ProjectId",
                table: "Tickets",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Tickets_ParentId",
                table: "Tickets",
                column: "ParentId",
                principalTable: "Tickets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Epics_Projects_ProjectId",
                table: "Epics");

            migrationBuilder.DropForeignKey(
                name: "FK_Sprints_Projects_ProjectId",
                table: "Sprints");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Projects_ProjectId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Tickets_ParentId",
                table: "Tickets");

            migrationBuilder.DropTable(
                name: "Bugs");

            migrationBuilder.DropTable(
                name: "Fixes");

            migrationBuilder.DropTable(
                name: "ProjectMembers");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "UserStories");

            migrationBuilder.DropTable(
                name: "WorkflowTransitions");

            migrationBuilder.DropTable(
                name: "Workflows");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_ProjectId_Type_Number",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Sprints_OneActivePerProject",
                table: "Sprints");

            migrationBuilder.DropIndex(
                name: "IX_Epics_ProjectId_Number",
                table: "Epics");

            migrationBuilder.DropColumn(
                name: "Number",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Sprints");

            migrationBuilder.DropColumn(
                name: "Number",
                table: "Epics");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Epics");

            migrationBuilder.RenameColumn(
                name: "PlatformRole",
                table: "Users",
                newName: "Role");

            // Back to UserRole: SuperAdmin returns to 6, everyone else to viewer. The projects, epics,
            // sprints and tickets emptied by Up are not restored; the old seed rows below come back.
            migrationBuilder.Sql("UPDATE \"Users\" SET \"Role\" = CASE WHEN \"Role\" = 1 THEN 6 ELSE 0 END;");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "Tickets",
                newName: "Points");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Tickets",
                type: "character varying(13)",
                maxLength: 13,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(24)",
                oldMaxLength: 24);

            migrationBuilder.AddColumn<string>(
                name: "ExtraFields",
                table: "Tickets",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Epics",
                type: "character varying(13)",
                maxLength: 13,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(24)",
                oldMaxLength: 24);

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
                    { 1, "admin@req2ticket.com", "Admin", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6", 5 },
                    { 2, "productowner@req2ticket.com", "Product Owner", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6", 4 },
                    { 3, "scrummaster@req2ticket.com", "Scrum Master", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6", 3 },
                    { 4, "developer@req2ticket.com", "Developer", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6", 2 },
                    { 5, "superadmin@req2ticket.com", "Super Admin", "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6", 6 }
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

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Tickets_ParentId",
                table: "Tickets",
                column: "ParentId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
