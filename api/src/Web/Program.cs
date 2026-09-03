using Application.Services;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Repositories;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
// Enums travel as strings in both directions ("medium"), not as ints.
// This covers serialization only: to get the OpenAPI schema right too, each enum also
// carries [JsonConverter(typeof(JsonStringEnumConverter<T>))] on the type itself.
builder.Services.AddControllers()
    .AddJsonOptions(jsonOptions =>
        jsonOptions.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

#region Dependency Injection

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEpicRepository, EpicRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ISprintRepository, SprintRepository>();
builder.Services.AddScoped<EpicService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<SprintService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();

// Stateless and thread safe, so one instance for the whole app is enough.
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<TokenService>();

#endregion

#region Authentication

// Read here and not inside TokenService so a missing key stops the app at startup, with a
// message that says how to fix it, instead of turning the first login into a 500.
string jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Falta la configuración Jwt:Key. En desarrollo: " +
        "dotnet user-secrets set \"Jwt:Key\" \"<al menos 32 caracteres>\" --project src/Web");

// HMAC-SHA256 refuses to sign with a key shorter than its own output. Checking the length
// here turns a confusing runtime exception into a startup error.
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key debe tener al menos 32 bytes (32 caracteres ASCII).");
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

    // Opens the door of /api/users to both administrative roles. Which of the two may do what
    // to a given user is UserService's call: a policy only knows the role of the caller.
    authorizationOptions.AddPolicy(
        "CanManageUsers",
        policy => policy.RequireRole(RoleNames.Of(UserRole.SuperAdmin), RoleNames.Of(UserRole.Admin)));

    // Everyone except Viewer, listed by exclusion so a new role can edit by default and
    // read-only stays the deliberate exception.
    authorizationOptions.AddPolicy(
        "CanEditEpics",
        policy => policy.RequireRole(RoleNames.AllExcept(UserRole.Viewer)));

    authorizationOptions.AddPolicy(
        "CanEditTickets",
        policy => policy.RequireRole(RoleNames.AllExcept(UserRole.Viewer)));

    authorizationOptions.AddPolicy(
        "CanEditSprints",
        policy => policy.RequireRole(RoleNames.AllExcept(UserRole.Viewer)));
});

#endregion

builder.Services.AddCors();

// The string in appsettings.json matches the setup in api/dotnet-commands.md, with no password
// because a Homebrew cluster trusts local connections. If yours needs one, put the whole string
// in user-secrets under the same key and it wins.
builder.Services.AddDbContext<Req2TicketContext>(dbContextOptions =>
    dbContextOptions.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // OpenAPI document at /openapi/v1.json
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Wide open for development: the front end just needs to be able to call the API.
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

// Order is not a style choice: authentication builds the identity from the Authorization
// header, and authorization is what decides whether that identity may proceed. Both have to
// run before the endpoint.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
