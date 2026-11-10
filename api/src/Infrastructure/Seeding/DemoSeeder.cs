using Application.Services;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Seeding;

/* Settings under "Seed" (OPS-1). In Azure they are App Settings (Seed__Demo, Seed__DemoPassword…);
   locally, appsettings.Development.json, which is gitignored. No password ever lives in the code.

     Demo                true in dev and local: two demo projects with data.
     DemoPassword        the password of every demo user.
     SuperAdminEmail     prod: the first SuperAdmin, created if missing.
     SuperAdminPassword  its password (falls back to DemoPassword). */
public sealed class SeedOptions
{
    public bool Demo { get; set; }

    public string? DemoPassword { get; set; }

    public string? SuperAdminEmail { get; set; }

    public string? SuperAdminPassword { get; set; }
}

/* Creates the demo data when the database has no projects yet, and the initial SuperAdmin when it is
   missing. Idempotent: running it again changes nothing.

   It goes through the services, not straight to the tables, so the codes come from the real counters
   (R2T-UH-1…) and every rule a user would hit also holds for the demo. That is also why the order
   below matters: a story can only be done once its children are, and the R2T workflow is created
   last, after every ticket is already in its status. */
public class DemoSeeder
{
    private readonly Req2TicketContext _context;
    private readonly SeedOptions _options;
    private readonly ILogger<DemoSeeder> _logger;
    private readonly IUserRepository _userRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserService _userService;
    private readonly ProjectService _projectService;
    private readonly MemberService _memberService;
    private readonly EpicService _epicService;
    private readonly SprintService _sprintService;
    private readonly TicketService _ticketService;
    private readonly WorkflowService _workflowService;

    public DemoSeeder(
        Req2TicketContext context,
        SeedOptions options,
        ILogger<DemoSeeder> logger,
        IUserRepository userRepository,
        IProjectRepository projectRepository,
        IUnitOfWork unitOfWork,
        UserService userService,
        ProjectService projectService,
        MemberService memberService,
        EpicService epicService,
        SprintService sprintService,
        TicketService ticketService,
        WorkflowService workflowService)
    {
        _context = context;
        _options = options;
        _logger = logger;
        _userRepository = userRepository;
        _projectRepository = projectRepository;
        _unitOfWork = unitOfWork;
        _userService = userService;
        _projectService = projectService;
        _memberService = memberService;
        _epicService = epicService;
        _sprintService = sprintService;
        _ticketService = ticketService;
        _workflowService = workflowService;
    }

    public async Task RunAsync()
    {
        if (!_options.Demo && string.IsNullOrWhiteSpace(_options.SuperAdminEmail))
        {
            return;
        }

        // The schema has to exist first. In the deploy, the migrations bundle runs before the app.
        if ((await _context.Database.GetPendingMigrationsAsync()).Any())
        {
            _logger.LogWarning("Seeding skipped: the database has pending migrations.");
            return;
        }

        await EnsureSuperAdminAsync();

        if (!_options.Demo)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.DemoPassword))
        {
            _logger.LogWarning("Demo seeding skipped: Seed:DemoPassword is not set.");
            return;
        }

        if (await _projectRepository.AnyAsync())
        {
            return;
        }

        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();
        await SeedDemoAsync(_options.DemoPassword);
        await transaction.CommitAsync();

        _logger.LogInformation("Demo data created: projects R2T and DEMO.");
    }

    private async Task EnsureSuperAdminAsync()
    {
        if (string.IsNullOrWhiteSpace(_options.SuperAdminEmail))
        {
            return;
        }

        string? password = _options.SuperAdminPassword ?? _options.DemoPassword;
        if (string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("SuperAdmin not created: Seed:SuperAdminPassword is not set.");
            return;
        }

        string email = _options.SuperAdminEmail.Trim().ToLowerInvariant();
        if (await _userRepository.GetByEmailAsync(email) is not null)
        {
            return;
        }

        await _userService.CreateAsync(
            new User { Name = "Super Admin", Email = email, PlatformRole = PlatformRole.SuperAdmin },
            password);

        _logger.LogInformation("Initial SuperAdmin created.");
    }

    private async Task SeedDemoAsync(string password)
    {
        // One person per role. developer@ is also in DEMO with another role, to show that the role
        // belongs to the project, not to the person. The login's demo buttons use these emails.
        User admin = await GetOrCreateUserAsync("Lucía Fernández", "admin@req2ticket.com", password);
        User productOwner = await GetOrCreateUserAsync("Martín Gómez", "productowner@req2ticket.com", password);
        User scrumMaster = await GetOrCreateUserAsync("Sofía Ruiz", "scrummaster@req2ticket.com", password);
        User developer = await GetOrCreateUserAsync("Diego Pérez", "developer@req2ticket.com", password);
        User qa = await GetOrCreateUserAsync("Valentina López", "qa@req2ticket.com", password);
        User viewer = await GetOrCreateUserAsync("Tomás Díaz", "viewer@req2ticket.com", password);
        await GetOrCreateUserAsync("Super Admin", "superadmin@req2ticket.com", password, PlatformRole.SuperAdmin);

        await SeedR2tAsync(admin, productOwner, scrumMaster, developer, qa, viewer);
        await SeedDemoProjectAsync(admin, productOwner, developer);
    }

    private async Task SeedR2tAsync(User admin, User productOwner, User scrumMaster, User developer, User qa, User viewer)
    {
        Project project = await _projectService.CreateAsync(
            admin.Id, "R2T", "Req2Ticket", "El producto que estamos construyendo: de requerimientos a tickets.");
        int pid = project.Id;

        await _memberService.AddAsync(pid, productOwner.Email, ProjectRole.ProductOwner);
        await _memberService.AddAsync(pid, scrumMaster.Email, ProjectRole.ScrumMaster);
        await _memberService.AddAsync(pid, developer.Email, ProjectRole.Developer);
        await _memberService.AddAsync(pid, qa.Email, ProjectRole.Qa);
        await _memberService.AddAsync(pid, viewer.Email, ProjectRole.Viewer);

        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

        Epic auth = await CreateEpicAsync(pid, "Autenticación y cuentas", EpicAccentColor.Blue, productOwner.Id,
            "Registro, inicio de sesión y recuperación de la cuenta.");
        Epic board = await CreateEpicAsync(pid, "Tablero y sprints", EpicAccentColor.Purple, scrumMaster.Id,
            "Planificar el trabajo y seguirlo en el tablero.");
        Epic notifications = await CreateEpicAsync(pid, "Notificaciones", EpicAccentColor.Teal, null,
            "Avisar a cada persona de lo que le toca.");
        Epic onboarding = await CreateEpicAsync(pid, "Onboarding", EpicAccentColor.Green, productOwner.Id,
            "La primera experiencia de un equipo nuevo.");

        Sprint sprint1 = await _sprintService.CreateAsync(pid, new Sprint
        {
            Name = "Sprint 1", Goal = "Que un usuario pueda entrar.", Capacity = 20,
            StartDate = today.AddDays(-28), EndDate = today.AddDays(-15)
        });
        Sprint sprint2 = await _sprintService.CreateAsync(pid, new Sprint
        {
            Name = "Sprint 2", Goal = "Registro completo y tablero usable.", Capacity = 30,
            StartDate = today.AddDays(-10), EndDate = today.AddDays(4)
        });
        Sprint sprint3 = await _sprintService.CreateAsync(pid, new Sprint
        {
            Name = "Sprint 3", Goal = "Cerrar sprints con trabajo abierto.", Capacity = 25,
            StartDate = today.AddDays(5), EndDate = today.AddDays(18)
        });

        // Sprint 1, already finished. Its tickets go in first: an empty sprint can't be started.
        Ticket login = await CreateTicketAsync(pid, admin.Id, new UserStory
        {
            Title = "Login con email y contraseña", EpicId = auth.Id, SprintId = sprint1.Id, AssigneeId = developer.Id,
            Priority = TicketPriority.High, Points = 5,
            Description = "Como usuario registrado quiero entrar con mi email y contraseña para ver mis proyectos.",
            AcceptanceCriteria = Items(("Con credenciales correctas entra al último proyecto", true),
                ("Con credenciales incorrectas muestra un error sin decir cuál falló", true),
                ("\"Mantener sesión\" recuerda la sesión al cerrar el navegador", true)),
            DefinitionOfDone = Items(("Probado en Chrome y Safari", true), ("Revisado por QA", true))
        });
        Ticket loginForm = await CreateTicketAsync(pid, developer.Id, new TicketTask
        {
            Title = "Formulario de login", EpicId = auth.Id, SprintId = sprint1.Id, ParentId = login.Id,
            AssigneeId = developer.Id, Points = 3,
            Checklist = Items(("Campos de email y contraseña", true), ("Errores al lado de cada campo", true))
        });
        Ticket welcome = await CreateTicketAsync(pid, productOwner.Id, new UserStory
        {
            Title = "Pantalla de bienvenida", EpicId = onboarding.Id, SprintId = sprint1.Id, AssigneeId = developer.Id,
            Points = 2, AcceptanceCriteria = Items(("Explica qué es un proyecto", true))
        });

        await StartAsync(pid, sprint1);
        await SetStatusesAsync(pid, (loginForm, TicketStatus.Done), (login, TicketStatus.Done), (welcome, TicketStatus.Done));
        await _sprintService.CompleteAsync(pid, sprint1.Id, null);

        // An epic closes only with every ticket closed, so Onboarding can be closed now.
        await _epicService.UpdateAsync(pid, onboarding.Id, new Epic
        {
            Name = onboarding.Name, Description = onboarding.Description, AccentColor = onboarding.AccentColor,
            Priority = onboarding.Priority, Status = EpicStatus.Closed, OwnerId = onboarding.OwnerId
        });

        // Sprint 2, in progress: the board of the demo.
        Ticket register = await CreateTicketAsync(pid, productOwner.Id, new UserStory
        {
            Title = "Registro de usuarios", EpicId = auth.Id, SprintId = sprint2.Id, AssigneeId = developer.Id,
            Priority = TicketPriority.High, Points = 8,
            Description = "Como persona nueva quiero crear mi cuenta para empezar a usar Req2Ticket.",
            AcceptanceCriteria = Items(("Pide nombre, email y contraseña", true),
                ("La contraseña cumple las reglas y se ven mientras se escribe", true),
                ("Al registrarse entra directo, sin volver a loguearse", false)),
            DefinitionOfReady = Items(("Diseño aprobado", true), ("Reglas de contraseña definidas", true)),
            DefinitionOfDone = Items(("Probado por QA", false), ("Sin errores en consola", false))
        });
        Ticket passwordRules = await CreateTicketAsync(pid, developer.Id, new TicketTask
        {
            Title = "Validar contraseña segura en el API", EpicId = auth.Id, SprintId = sprint2.Id, ParentId = register.Id,
            AssigneeId = developer.Id, Points = 3,
            Checklist = Items(("Largo de 8 a 72", true), ("Mayúscula, número y carácter especial", true), ("Mensaje claro en inglés", false))
        });
        await CreateTicketAsync(pid, developer.Id, new TicketTask
        {
            Title = "Pantalla de registro", EpicId = auth.Id, SprintId = sprint2.Id, ParentId = register.Id,
            AssigneeId = developer.Id, Points = 2
        });
        Ticket emailBug = await CreateTicketAsync(pid, qa.Id, new Bug
        {
            Title = "El registro acepta emails sin dominio", EpicId = auth.Id, SprintId = sprint2.Id, ParentId = register.Id,
            AssigneeId = qa.Id, Priority = TicketPriority.High, Severity = BugSeverity.Major,
            StepsToReproduce = "1. Ir a /register\n2. Escribir \"ana@empresa\" como email\n3. Completar el resto y enviar",
            ExpectedResult = "Un error al lado del email.", ActualResult = "Crea la cuenta.", Environment = "Chrome 141, macOS"
        });
        Ticket emailFix = await CreateTicketAsync(pid, developer.Id, new Fix
        {
            Title = "Validar el dominio del email", EpicId = auth.Id, SprintId = sprint2.Id, ParentId = emailBug.Id,
            AssigneeId = developer.Id, RegressionRisk = RegressionRisk.Low,
            RootCause = "La validación del front solo miraba el arroba.",
            VerificationSteps = Items(("ana@empresa da error", true), ("ana@empresa.com.ar se acepta", false))
        });
        await CreateTicketAsync(pid, scrumMaster.Id, new UserStory
        {
            Title = "Arrastrar tickets entre columnas", EpicId = board.Id, SprintId = sprint2.Id, AssigneeId = developer.Id,
            Points = 8, AcceptanceCriteria = Items(("Las columnas prohibidas se atenúan", false), ("Funciona con teclado", false))
        });
        Ticket sprintHeader = await CreateTicketAsync(pid, scrumMaster.Id, new TicketTask
        {
            Title = "Encabezado del sprint en el tablero", EpicId = board.Id, SprintId = sprint2.Id, AssigneeId = developer.Id,
            Points = 2, Checklist = Items(("Días restantes", true), ("Puntos completados", true))
        });
        await CreateTicketAsync(pid, qa.Id, new Bug
        {
            Title = "El tablero no refresca al cambiar de sprint", EpicId = board.Id, SprintId = sprint2.Id,
            Severity = BugSeverity.Minor, StepsToReproduce = "1. Abrir el tablero\n2. Completar el sprint desde otra pestaña"
        });
        // Not every bug belongs to an epic: this one is about the whole app.
        await CreateTicketAsync(pid, qa.Id, new Bug
        {
            Title = "El modo oscuro se pierde al recargar", SprintId = sprint2.Id, AssigneeId = developer.Id,
            Severity = BugSeverity.Minor, StepsToReproduce = "1. Activar el modo oscuro\n2. Recargar la página",
            ExpectedResult = "Sigue oscuro.", ActualResult = "Vuelve al modo claro."
        });

        await StartAsync(pid, sprint2);
        await SetStatusesAsync(pid,
            (register, TicketStatus.InProgress),
            (passwordRules, TicketStatus.InReview),
            (emailBug, TicketStatus.Testing),
            (emailFix, TicketStatus.InProgress),
            (sprintHeader, TicketStatus.Done));

        // Sprint 3 and the backlog.
        await CreateTicketAsync(pid, scrumMaster.Id, new UserStory
        {
            Title = "Completar un sprint con trabajo abierto", EpicId = board.Id, SprintId = sprint3.Id, Points = 5,
            AcceptanceCriteria = Items(("Elegir a dónde van los tickets abiertos", false))
        });
        await CreateTicketAsync(pid, productOwner.Id, new UserStory
        {
            Title = "Recuperar contraseña", EpicId = auth.Id, Points = 5, Priority = TicketPriority.Medium,
            AcceptanceCriteria = Items(("Llega un email con un enlace", false), ("El enlace vence en una hora", false))
        });
        await CreateTicketAsync(pid, productOwner.Id, new UserStory
        {
            Title = "Avisos por email", EpicId = notifications.Id, Priority = TicketPriority.Low
        });

        // Work that belongs to no epic: upkeep, and a bug nobody has looked at yet.
        await CreateTicketAsync(pid, developer.Id, new TicketTask
        {
            Title = "Actualizar dependencias del front", Points = 1, Priority = TicketPriority.Low,
            Checklist = Items(("React y Vite", false), ("TanStack Query", false))
        });
        await CreateTicketAsync(pid, viewer.Id, new Bug
        {
            Title = "El favicon no aparece en Firefox", Severity = BugSeverity.Trivial,
            StepsToReproduce = "1. Abrir la app en Firefox\n2. Mirar la pestaña"
        });

        // Last, so the statuses above did not have to follow it. Done and cancelled can be
        // reopened: a mistaken click is never final.
        await _workflowService.ReplaceAsync(pid,
        [
            (TicketStatus.Todo, TicketStatus.InProgress),
            (TicketStatus.Todo, TicketStatus.Cancelled),
            (TicketStatus.InProgress, TicketStatus.Todo),
            (TicketStatus.InProgress, TicketStatus.InReview),
            (TicketStatus.InProgress, TicketStatus.Cancelled),
            (TicketStatus.InReview, TicketStatus.InProgress),
            (TicketStatus.InReview, TicketStatus.Testing),
            (TicketStatus.InReview, TicketStatus.Cancelled),
            (TicketStatus.Testing, TicketStatus.InReview),
            (TicketStatus.Testing, TicketStatus.Done),
            (TicketStatus.Testing, TicketStatus.Cancelled),
            (TicketStatus.Done, TicketStatus.InProgress),
            (TicketStatus.Cancelled, TicketStatus.Todo)
        ]);
    }

    // No workflow here: the same status selector offers every status.
    private async Task SeedDemoProjectAsync(User admin, User productOwner, User developer)
    {
        Project project = await _projectService.CreateAsync(
            admin.Id, "DEMO", "Tienda online", "Proyecto de ejemplo para probar sin miedo.");
        int pid = project.Id;

        await _memberService.AddAsync(pid, developer.Email, ProjectRole.ScrumMaster);
        await _memberService.AddAsync(pid, productOwner.Email, ProjectRole.Viewer);

        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

        Epic catalog = await CreateEpicAsync(pid, "Catálogo de productos", EpicAccentColor.Orange, admin.Id,
            "Que se puedan ver y buscar los productos.");

        Sprint sprint = await _sprintService.CreateAsync(pid, new Sprint
        {
            Name = "Sprint 1", Goal = "Un catálogo navegable.", Capacity = 15,
            StartDate = today.AddDays(-3), EndDate = today.AddDays(11)
        });

        Ticket list = await CreateTicketAsync(pid, admin.Id, new UserStory
        {
            Title = "Listado de productos", EpicId = catalog.Id, SprintId = sprint.Id, AssigneeId = developer.Id, Points = 5,
            AcceptanceCriteria = Items(("Muestra foto, nombre y precio", false))
        });
        Ticket filter = await CreateTicketAsync(pid, developer.Id, new TicketTask
        {
            Title = "Filtro por categoría", EpicId = catalog.Id, SprintId = sprint.Id, ParentId = list.Id,
            AssigneeId = developer.Id, Points = 3
        });
        await CreateTicketAsync(pid, admin.Id, new Bug
        {
            Title = "Las imágenes no cargan en Safari", EpicId = catalog.Id, SprintId = sprint.Id,
            Severity = BugSeverity.Major, StepsToReproduce = "1. Abrir el catálogo en Safari\n2. Mirar las fotos"
        });
        await CreateTicketAsync(pid, developer.Id, new TicketTask
        {
            Title = "Configurar el dominio de la tienda", Points = 2
        });

        await StartAsync(pid, sprint);
        await SetStatusesAsync(pid, (filter, TicketStatus.InProgress));
    }

    private async Task<User> GetOrCreateUserAsync(
        string name, string email, string password, PlatformRole platformRole = PlatformRole.User)
    {
        User? existing = await _userRepository.GetByEmailAsync(email);
        if (existing is not null)
        {
            return existing;
        }

        return await _userService.CreateAsync(
            new User { Name = name, Email = email, PlatformRole = platformRole },
            password);
    }

    // Every epic is born open; closing one is an update (see Onboarding).
    private async Task<Epic> CreateEpicAsync(
        int projectId, string name, EpicAccentColor color, int? ownerId, string description) =>
        await _epicService.CreateAsync(projectId, new Epic
        {
            Name = name, Description = description, AccentColor = color, OwnerId = ownerId,
            Priority = EpicPriority.Medium
        });

    // Starts it with the dates it was planned with, past ones included (the request's "not in the
    // past" check is not on this path).
    private async Task StartAsync(int projectId, Sprint sprint) =>
        await _sprintService.StartAsync(projectId, sprint.Id, sprint.StartDate, sprint.EndDate);

    private async Task<Ticket> CreateTicketAsync(int projectId, int reporterId, Ticket ticket) =>
        await _ticketService.CreateAsync(projectId, reporterId, ticket);

    private async Task SetStatusesAsync(int projectId, params (Ticket Ticket, TicketStatus Status)[] changes)
    {
        foreach ((Ticket ticket, TicketStatus status) in changes)
        {
            await _ticketService.ChangeStatusAsync(projectId, ticket.Id, status);
        }
    }

    private static List<ChecklistItem> Items(params (string Text, bool Done)[] items) =>
        items.Select(item => new ChecklistItem { Text = item.Text, Done = item.Done }).ToList();
}
