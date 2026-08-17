using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure;

public class Req2TicketContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public DbSet<Epic> Epics { get; set; }

    public DbSet<Sprint> Sprints { get; set; }

    public Req2TicketContext(DbContextOptions<Req2TicketContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Deleting a user does not delete their epics: they are left without an owner.
        modelBuilder.Entity<Epic>()
            .HasOne(e => e.Owner)
            .WithMany()
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Epic>()
            .HasIndex(e => e.Code)
            .IsUnique();

        // NOCASE so logging in does not depend on how the email was typed. SQLite compares
        // strings case-sensitively by default, and the unique index inherits the collation,
        // so two users cannot differ only in capitalization either.
        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .UseCollation("NOCASE");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // The hashes are hardcoded for the same reason the epic codes below are: HasData
        // compares its values against the model snapshot on every "migrations add", and
        // BCrypt salts randomly, so hashing here would produce a different value on every
        // run and a permanent "pending model changes" warning.
        //
        // The passwords behind them are the ones documented in api/postman and Web.http:
        // Passw0rd! · Camila#25 · Martin$77 · Sofia*9x1 — seed data for a local database,
        // not credentials for anything that matters.
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
            }
        );

        // The codes are hardcoded on purpose: HasData compares its values against the model
        // snapshot on every "migrations add", so a generated one would produce a spurious
        // UpdateData and a permanent "pending model changes" warning.
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
    }
}
