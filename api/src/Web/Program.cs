using Application.Services;
using Domain.Interfaces;
using Infrastructure.Repositories;
using Infrastructure.Seeding;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Text;
using Web.Authorization;
using Web.Filters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers(mvcOptions =>
    {
        // One place turns broken rules into 400/403/409. See ApiExceptionFilter.
        mvcOptions.Filters.Add<ApiExceptionFilter>();

        // Validation errors are keyed by the JSON name ("bug.stepsToReproduce"), not the C# one
        // ("Bug.StepsToReproduce"), so the front end can put each message under its own field.
        mvcOptions.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
    })
    .AddJsonOptions(jsonOptions =>
    {
        // Enums travel as strings in both directions ("medium"), not as ints.
        jsonOptions.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

        /* An unknown property is a 400, not silence. Without this, "bug" sent on a task, a typo like
           "titel", or a "status" in a ticket's PUT would be dropped quietly and the client would
           believe it had been saved. */
        jsonOptions.JsonSerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;
    });

#region Dependency Injection

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectMemberRepository, ProjectMemberRepository>();
builder.Services.AddScoped<IEpicRepository, EpicRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ISprintRepository, SprintRepository>();
builder.Services.AddScoped<IWorkflowRepository, WorkflowRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<ProjectAccessService>();
builder.Services.AddScoped<MemberService>();
builder.Services.AddScoped<EpicService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<SprintService>();
builder.Services.AddScoped<WorkflowService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DemoSeeder>();
builder.Services.AddSingleton(builder.Configuration.GetSection("Seed").Get<SeedOptions>() ?? new SeedOptions());

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentUser>();

// Stateless and thread safe, so one instance for the whole app is enough.
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<TokenService>();

#endregion

#region Authentication

// Read here and not inside TokenService so a missing key stops the app at startup, with a
// message that says how to fix it, instead of turning the first login into a 500.
string jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key is missing. In development: " +
        "dotnet user-secrets set \"Jwt:Key\" \"<at least 32 characters>\" --project src/Web");

// HMAC-SHA256 refuses to sign with a key shorter than its own output. Checking the length
// here turns a confusing runtime exception into a startup error.
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key must be at least 32 bytes (32 ASCII characters).");
}

var jwtSettings = new JwtSettings(
    Key: jwtKey,
    Issuer: builder.Configuration["Jwt:Issuer"] ?? "req2ticket-api",
    Audience: builder.Configuration["Jwt:Audience"] ?? "req2ticket-web",
    ExpiresHours: builder.Configuration.GetValue("Jwt:ExpiresHours", 8));

builder.Services.AddSingleton(jwtSettings);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(jwtBearerOptions =>
    {
        // Without this, ASP.NET rewrites "sub" and "role" into long SOAP-era URIs and the
        // claims stop being readable by the names TokenService wrote.
        jwtBearerOptions.MapInboundClaims = false;

        jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            NameClaimType = "name",
            RoleClaimType = "role",
            // The default allows a token to keep working for five minutes past its expiry to
            // absorb clock drift between servers. The same process signs and validates here,
            // so there is no drift to absorb.
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(authorizationOptions =>
{
    // Deny by default. Every endpoint requires a valid token unless it says [AllowAnonymous]:
    // forgetting an [Authorize] would leave a hole open silently, while forgetting an
    // [AllowAnonymous] breaks on the first request and gets noticed.
    authorizationOptions.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    // No role policies: what someone may do depends on the project, so it is decided by the
    // [RequireProjectPermission] filters (Web/Authorization), which read the role from the database.
});

#endregion

// Only the front ends listed in Cors:Origins may call the API from a browser. appsettings.json
// lists the Vite dev server, and in Azure each App Service replaces that entry with its own
// front end through Cors__Origins__0. An empty list blocks every browser origin, while curl and
// Postman keep working because CORS is enforced by the browser, not the server.
string[] allowedOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];

builder.Services.AddCors(corsOptions =>
    corsOptions.AddPolicy("Front", policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

// The string in appsettings.json matches the setup in api/dotnet-commands.md, with no password
// because a Homebrew cluster trusts local connections. If yours needs one, put the whole string
// in user-secrets under the same key and it wins.
builder.Services.AddDbContext<Req2TicketContext>(dbContextOptions =>
    dbContextOptions.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// What the deploy pipeline checks after publishing. A green deploy only proves the files were
// copied, so /health also opens a connection to the database: a missing or mistyped connection
// string fails here instead of on the first real request.
builder.Services.AddHealthChecks()
    .AddDbContextCheck<Req2TicketContext>();

var app = builder.Build();

/* Demo data and the initial SuperAdmin (OPS-1), driven by the Seed:* settings. After Build() on
   purpose: `dotnet ef` stops the host right at Build(), so this never runs while creating or
   applying migrations, and it skips itself if the database still has migrations pending. */
using (IServiceScope scope = app.Services.CreateScope())
{
    await scope.ServiceProvider.GetRequiredService<DemoSeeder>().RunAsync();
}

if (app.Environment.IsDevelopment())
{
    // OpenAPI document at /openapi/v1.json
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("Front");

// Order is not a style choice: authentication builds the identity from the Authorization
// header, and authorization is what decides whether that identity may proceed. Both have to
// run before the endpoint.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Anonymous because the fallback policy would otherwise demand a token, and the pipeline has
// none. It answers only "Healthy" or "Unhealthy", so nothing about the database leaks.
app.MapHealthChecks("/health").AllowAnonymous();

app.Run();
