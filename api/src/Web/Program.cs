using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Services;
using Domain.Interfaces;
using Infrastructure;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Enums travel as strings in both directions ("medium"), not as ints.
// This covers serialization only: to get the OpenAPI schema right too, each enum also
// carries [JsonConverter(typeof(JsonStringEnumConverter<T>))] on the type itself.
builder.Services.AddControllers()
    .AddJsonOptions(jsonOptions =>
        jsonOptions.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

#region Dependency Injection

// One line per entity, interface -> implementation:
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEpicRepository, EpicRepository>();
builder.Services.AddScoped<EpicService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();

#endregion

builder.Services.AddCors();

builder.Services.AddDbContext<Req2TicketContext>(dbContextOptions =>
    dbContextOptions.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// To move to SQL Server: swap the package for Microsoft.EntityFrameworkCore.SqlServer,
// use the SqlServerConnection string from appsettings.json and regenerate the migrations.
// dbContextOptions.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnection"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // OpenAPI document at /openapi/v1.json
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Wide open for development: the front end just needs to be able to call the API.
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.MapControllers();

app.Run();
