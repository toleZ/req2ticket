using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure;

// Every row the database starts with, kept out of Req2TicketContext so that file stays what it
// says on the tin: the DbSets and the relationships between them. Nothing here is a rule about
// the model, it is just data.
//
// One constraint governs the whole file, and it is the reason so much of it is hardcoded:
// HasData compares its values against the model snapshot on every "migrations add", so anything
// that changes between runs — a generated code, a BCrypt hash, DateTimeOffset.UtcNow — produces
// a spurious diff and a permanent "pending model changes" warning. Literals only.
internal static class SeedData
{
    // Order is for the reader, not for the database: EF sorts the inserts by foreign key itself,
    // which is how TASK-7H4N2P6R ends up written after the story it hangs from.
    public static void Apply(ModelBuilder modelBuilder)
    {
        SeedUsers(modelBuilder);
        SeedEpics(modelBuilder);
        SeedSprints(modelBuilder);
        SeedTickets(modelBuilder);
    }

    // BCrypt salts randomly, so the hashes are literals like everything else here.
    //
    // The passwords behind them are the ones documented in api/postman and Web.http:
    // Passw0rd! · Camila#25 · Martin$77 · Sofia*9x1 · Sup3rAdm!n — seed data for a local
    // database, not credentials for anything that matters.
    //
    // Seeding id 5 is the only way to get a superAdmin: RegisterAsync always creates a viewer,
    // and only a superAdmin may hand the role out. Drop this row and the top of the hierarchy
    // is unreachable without editing the database by hand.
    private static void SeedUsers(ModelBuilder modelBuilder) =>
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "Juan Cruz",
                Email = "juan@req2ticket.com",
                PasswordHash = "$2a$11$OxumkutAnNycObUAp.sI5OR8/FoDacrtay0b2z61feEKJxGR5Tzd6",
                Role = UserRole.Admin
            },
            new User
            {
                Id = 2,
                Name = "Camila Rossi",
                Email = "camila@req2ticket.com",
                PasswordHash = "$2a$11$9JK.29wC/YYDMPrx/17SzuQXEnij2SgPTrAAVOfG6BWtoBwgtOA5e",
                Role = UserRole.ProductOwner
            },
            new User
            {
                Id = 3,
                Name = "Martín Díaz",
                Email = "martin@req2ticket.com",
                PasswordHash = "$2a$11$5YLkOMjlsgsrGOqYxhb8s.0V9wC7UKQOn3zrHRH5SZh4oMMIOdt/S",
                Role = UserRole.ScrumMaster
            },
            new User
            {
                Id = 4,
                Name = "Sofía Vega",
                Email = "sofia@req2ticket.com",
                PasswordHash = "$2a$11$LtN.MT4Q48L1DP4qVhzCK.FpO09sg2QRWHfkiFpJxBHqQM21ftqGS",
                Role = UserRole.Developer
            },
            new User
            {
                Id = 5,
                Name = "Super Admin",
                Email = "super@req2ticket.com",
                PasswordHash = "$2a$11$fkAugXmXGHzCughLu.qRbOdUqu2RwMo53qyrsSgYum/LE1lDIaECq",
                Role = UserRole.SuperAdmin
            }
        );

    // The codes are literals rather than EpicCode.Generate() calls, same rule as above.
    private static void SeedEpics(ModelBuilder modelBuilder) =>
        modelBuilder.Entity<Epic>().HasData(
            new Epic
            {
                Id = 1,
                Code = "EPIC-7F3A2B9K",
                Name = "Autenticación",
                Description = "Login, registro y recuperación de contraseña.",
                AccentColor = EpicAccentColor.Blue,
                Priority = EpicPriority.High,
                Status = EpicStatus.Active,
                OwnerId = 1
            },
            new Epic
            {
                Id = 2,
                Code = "EPIC-M4XQ8T2V",
                Name = "Tablero Kanban",
                Description = "Columnas configurables y drag & drop.",
                AccentColor = EpicAccentColor.Purple,
                Priority = EpicPriority.Medium,
                Status = EpicStatus.Backlog,
                OwnerId = 2
            },
            new Epic
            {
                Id = 3,
                Code = "EPIC-9DZP5R3W",
                Name = "Gestión de sprints",
                Description = "Planificación, capacidad del equipo y cierre de sprint.",
                AccentColor = EpicAccentColor.Indigo,
                Priority = EpicPriority.High,
                Status = EpicStatus.Active,
                OwnerId = 3
            },
            new Epic
            {
                Id = 4,
                Code = "EPIC-2H6NKY4S",
                Name = "Historias de usuario",
                Description = "Alta, edición y estimación en puntos.",
                AccentColor = EpicAccentColor.Teal,
                Priority = EpicPriority.Urgent,
                Status = EpicStatus.Active,
                OwnerId = 4
            },
            new Epic
            {
                Id = 5,
                Code = "EPIC-QB8V3JM7",
                Name = "Panel de métricas",
                Description = "Velocity, burndown y lead time por equipo.",
                AccentColor = EpicAccentColor.Green,
                Priority = EpicPriority.Medium,
                Status = EpicStatus.Backlog,
                OwnerId = 1
            },
            new Epic
            {
                Id = 6,
                Code = "EPIC-5T9WGX2A",
                Name = "Notificaciones",
                Description = "Avisos por email y centro de notificaciones in-app.",
                AccentColor = EpicAccentColor.Orange,
                Priority = EpicPriority.Low,
                Status = EpicStatus.Backlog,
                OwnerId = 2
            },
            new Epic
            {
                Id = 7,
                Code = "EPIC-3RJ7C4ZP",
                Name = "Importador de requerimientos",
                Description = "Carga de documentos y extracción automática de tickets.",
                AccentColor = EpicAccentColor.Pink,
                Priority = EpicPriority.Urgent,
                Status = EpicStatus.Active,
                OwnerId = 3
            },
            new Epic
            {
                Id = 8,
                Code = "EPIC-K2M5NQ8D",
                Name = "Modo oscuro",
                Description = "Tema claro/oscuro con preferencia persistida.",
                AccentColor = EpicAccentColor.Yellow,
                Priority = EpicPriority.Low,
                Status = EpicStatus.Closed,
                OwnerId = 4
            }
        );

    private static void SeedSprints(ModelBuilder modelBuilder) =>
        modelBuilder.Entity<Sprint>().HasData(
            new Sprint
            {
                Id = 1,
                Name = "Sprint 6",
                Goal = "Cerrar el bloque de autenticación y dejar el listado de facturas en producción.",
                StartDate = new DateOnly(2026, 7, 22),
                EndDate = new DateOnly(2026, 8, 5),
                Capacity = 13,
                Status = SprintStatus.Completed
            },
            new Sprint
            {
                Id = 2,
                Name = "Sprint 7",
                Goal = "Segundo factor operativo y centro de incidencias abierto a los primeros clientes.",
                StartDate = new DateOnly(2026, 8, 5),
                EndDate = new DateOnly(2026, 8, 19),
                Capacity = 34,
                Status = SprintStatus.Active
            },
            new Sprint
            {
                Id = 3,
                Name = "Sprint 8",
                Goal = "Pagos con tarjeta y panel de administración de cuentas.",
                StartDate = new DateOnly(2026, 8, 19),
                EndDate = new DateOnly(2026, 9, 2),
                Capacity = 30,
                Status = SprintStatus.Planned
            }
        );

    // Codes and timestamps are both literals, same rule as above.
    //
    // The ten rows are deliberately a spread of everything the model can express, so the app
    // has something to show the moment it starts: all four types, all seven statuses, and two
    // parent links — TASK-7H4N2P6R belongs to UH-2F8K3M9Q, and FIX-4T6Z9M3V repairs
    // BUG-8P2W6D4K. TASK-9J4R7B2X is the cancelled one, which is what makes the "cancelled
    // counts as neither done nor pending" rule visible on the sprint card.
    //
    // Each ExtraFields literal is the canonical shape TicketExtrasValidator would emit for its
    // type: camelCase keys, declaration order, no nulls. Keep it that way — a seed document
    // carrying a key the type no longer accepts is a 400 on the first PUT to that ticket.
    private static void SeedTickets(ModelBuilder modelBuilder) =>
        modelBuilder.Entity<Ticket>().HasData(
            new Ticket
            {
                Id = 1,
                Code = "UH-2F8K3M9Q",
                Type = TicketType.UserStory,
                Title = "Inicio de sesión con email y contraseña",
                EpicId = 1,
                Priority = TicketPriority.High,
                Status = TicketStatus.Done,
                Points = 5,
                AssigneeId = 1,
                ReporterId = 2,
                SprintId = 1,
                ExtraFields = """{"acceptanceCriteria":[{"text":"Las credenciales válidas devuelven un token","done":true},{"text":"Las credenciales inválidas devuelven 401","done":true},{"text":"El token expira a las 8 horas","done":true}],"definitionOfReady":[{"text":"Diseño del formulario aprobado","done":true}],"definitionOfDone":[{"text":"Probado en Postman","done":true}]}""",
                CreatedAt = new DateTimeOffset(2026, 7, 22, 9, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 5, 17, 30, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 2,
                Code = "TASK-7H4N2P6R",
                Type = TicketType.Task,
                Title = "Endpoint POST /api/auth/login",
                Description = "Validar credenciales contra el hash BCrypt y firmar el JWT.",
                EpicId = 1,
                Priority = TicketPriority.High,
                Status = TicketStatus.Done,
                Points = 0,
                AssigneeId = 1,
                ReporterId = 1,
                SprintId = 1,
                ParentId = 1,
                ExtraFields = """{"checklist":[{"text":"Verificar el hash con BCrypt","done":true},{"text":"Firmar el token con HMAC-SHA256","done":true}]}""",
                CreatedAt = new DateTimeOffset(2026, 7, 22, 9, 15, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 4, 12, 0, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 3,
                Code = "UH-9D5Q8T3W",
                Type = TicketType.UserStory,
                Title = "Recuperación de contraseña por email",
                EpicId = 1,
                Priority = TicketPriority.Medium,
                Status = TicketStatus.InReview,
                Points = 3,
                AssigneeId = 4,
                ReporterId = 2,
                SprintId = 2,
                ExtraFields = """{"acceptanceCriteria":[{"text":"El enlace caduca a la hora","done":true},{"text":"Un email inexistente no revela que no existe","done":false},{"text":"El enlace solo puede usarse una vez","done":false}],"definitionOfReady":[],"definitionOfDone":[]}""",
                CreatedAt = new DateTimeOffset(2026, 8, 5, 10, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 12, 11, 20, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 4,
                Code = "UH-3K7V2X5Z",
                Type = TicketType.UserStory,
                Title = "Columnas configurables en el tablero",
                EpicId = 2,
                Priority = TicketPriority.Medium,
                Status = TicketStatus.Backlog,
                Points = 8,
                AssigneeId = 2,
                ReporterId = 2,
                SprintId = null,
                ExtraFields = """{"acceptanceCriteria":[{"text":"Se puede agregar una columna","done":false},{"text":"Se puede renombrar una columna","done":false},{"text":"Se puede reordenar una columna","done":false},{"text":"No se puede borrar una columna con tickets","done":false}],"definitionOfReady":[],"definitionOfDone":[]}""",
                CreatedAt = new DateTimeOffset(2026, 8, 6, 14, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 6, 14, 0, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 5,
                Code = "UH-5M9R4H2N",
                Type = TicketType.UserStory,
                Title = "Planificación de sprint con capacidad del equipo",
                EpicId = 3,
                Priority = TicketPriority.High,
                Status = TicketStatus.InProgress,
                Points = 5,
                AssigneeId = 3,
                ReporterId = 3,
                SprintId = 2,
                ExtraFields = """{"acceptanceCriteria":[{"text":"La capacidad se carga por sprint","done":true},{"text":"Se avisa cuando los puntos la superan","done":true},{"text":"El aviso no bloquea la planificación","done":false}],"definitionOfReady":[],"definitionOfDone":[]}""",
                CreatedAt = new DateTimeOffset(2026, 8, 5, 9, 30, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 14, 16, 45, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 6,
                Code = "BUG-8P2W6D4K",
                Type = TicketType.Bug,
                Title = "El burndown no descuenta los tickets cerrados fuera del sprint",
                Description = "La curva queda plana aunque el trabajo se haya terminado.",
                EpicId = 3,
                Priority = TicketPriority.Critical,
                Status = TicketStatus.InProgress,
                Points = 2,
                AssigneeId = 3,
                ReporterId = 2,
                SprintId = 2,
                ExtraFields = """{"severity":"major","stepsToReproduce":"1. Cerrar un ticket que está en el backlog.\n2. Abrir el burndown del sprint activo.","expectedResult":"La curva baja por los puntos cerrados.","actualResult":"La curva queda plana.","environment":"Local, PostgreSQL"}""",
                CreatedAt = new DateTimeOffset(2026, 8, 11, 8, 45, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 13, 10, 0, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 7,
                Code = "FIX-4T6Z9M3V",
                Type = TicketType.Fix,
                Title = "Recalcular el burndown al mover un ticket de sprint",
                EpicId = 3,
                Priority = TicketPriority.Critical,
                Status = TicketStatus.Testing,
                Points = 1,
                AssigneeId = 3,
                ReporterId = 3,
                SprintId = 2,
                ParentId = 6,
                ExtraFields = """{"rootCause":"El cálculo cachea los puntos al abrir el sprint y no vuelve a leerlos.","solution":"Recalcular al vuelo a partir de los tickets del sprint.","verificationSteps":[{"text":"Mover un ticket cerrado al backlog y ver bajar la curva","done":false},{"text":"Reabrir un ticket y ver subir la curva","done":false}],"regressionRisk":"medium"}""",
                CreatedAt = new DateTimeOffset(2026, 8, 13, 10, 5, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 13, 10, 5, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 8,
                Code = "TASK-6X3H8P5Q",
                Type = TicketType.Task,
                Title = "Filtro de tickets por responsable y prioridad",
                EpicId = 4,
                Priority = TicketPriority.Medium,
                Status = TicketStatus.Todo,
                Points = 2,
                AssigneeId = 2,
                ReporterId = 4,
                SprintId = null,
                ExtraFields = """{"checklist":[{"text":"Filtro por responsable","done":false},{"text":"Filtro por prioridad","done":false}]}""",
                CreatedAt = new DateTimeOffset(2026, 8, 7, 11, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 7, 11, 0, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 10,
                Code = "TASK-9J4R7B2X",
                Type = TicketType.Task,
                Title = "Migrar el tablero a drag & drop nativo",
                Description = "Se descartó: la librería actual ya cubre el caso.",
                EpicId = 2,
                Priority = TicketPriority.Low,
                Status = TicketStatus.Cancelled,
                Points = 3,
                AssigneeId = 2,
                ReporterId = 2,
                SprintId = 2,
                ExtraFields = """{"checklist":[]}""",
                CreatedAt = new DateTimeOffset(2026, 8, 8, 9, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 15, 15, 30, 0, TimeSpan.Zero)
            },
            new Ticket
            {
                Id = 9,
                Code = "UH-2N7K4V9M",
                Type = TicketType.UserStory,
                Title = "Persistencia de preferencia de tema claro/oscuro",
                EpicId = 8,
                Priority = TicketPriority.Low,
                Status = TicketStatus.Done,
                Points = 2,
                AssigneeId = 4,
                ReporterId = 1,
                SprintId = 1,
                ExtraFields = """{"acceptanceCriteria":[{"text":"La preferencia sobrevive a recargar la página","done":true},{"text":"Sin preferencia guardada se usa la del sistema","done":true}],"definitionOfReady":[],"definitionOfDone":[]}""",
                CreatedAt = new DateTimeOffset(2026, 7, 23, 13, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 8, 4, 9, 0, 0, TimeSpan.Zero)
            }
        );
}
