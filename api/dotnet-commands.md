# .NET CLI Commands Reference

Comandos usados en req2ticket. Todos se corren desde la raíz del proyecto, o sea la
carpeta que contiene `src/`.

## Projects & Solution

```bash
dotnet new sln -n MySolution --format sln          # Solución (.NET 10 crea .slnx sin --format)
dotnet new classlib -n MyProject -f net10.0        # Class Library
dotnet new webapi -n MyApi -f net10.0 --use-controllers
dotnet sln add MyProject/MyProject.csproj          # Agregar proyecto a la solución
dotnet sln remove MyProject/MyProject.csproj
```

## References & Packages

```bash
dotnet add src/Application/Application.csproj reference src/Domain/Domain.csproj
dotnet add src/Infrastructure/Infrastructure.csproj package Microsoft.EntityFrameworkCore
dotnet remove src/Infrastructure/Infrastructure.csproj package Microsoft.EntityFrameworkCore
dotnet restore
dotnet list package --vulnerable                   # Chequear vulnerabilidades conocidas
dotnet list package --outdated
```

## Files (classes, interfaces, etc.)

```bash
dotnet new class -n MyClass -o src/Domain/Entities
dotnet new interface -n IMyInterface -o src/Domain/Interfaces
dotnet new record -n MyRecord -o src/Web/DTOs
dotnet new enum -n MyEnum -o src/Domain/Entities
```

## Build & Run

```bash
dotnet build                                       # Compilar toda la solución
dotnet run --project src/Web/Web.csproj                # Levantar la API
dotnet watch --project src/Web/Web.csproj              # Con hot reload
dotnet clean
```

## Entity Framework Core

> Requiere la herramienta: `dotnet tool install --global dotnet-ef`
> (o `dotnet tool update --global dotnet-ef` si la versión quedó vieja).

En una solución multi-proyecto **siempre** hay que indicar dónde viven las migraciones
(`--project`) y dónde está la configuración para construir el DbContext (`--startup-project`):

```bash
# Crear migración
dotnet ef migrations add NombreMigracion --project src/Infrastructure --startup-project src/Web

# Aplicar a la base
dotnet ef database update --project src/Infrastructure --startup-project src/Web

# Listar migraciones
dotnet ef migrations list --project src/Infrastructure --startup-project src/Web

# Revertir la última migración (NO usar rm: también actualiza el ModelSnapshot)
dotnet ef migrations remove --project src/Infrastructure --startup-project src/Web

# Volver a un estado anterior de la base
dotnet ef database update NombreMigracionAnterior --project src/Infrastructure --startup-project src/Web

# Borrar la base
dotnet ef database drop --project src/Infrastructure --startup-project src/Web

# Ver el SQL sin aplicarlo
dotnet ef migrations script --project src/Infrastructure --startup-project src/Web
```

> El proyecto no aplica migraciones al arrancar: después de crear una, corré
> `dotnet ef database update` a mano.

## Secrets (desarrollo)

Para no commitear connection strings ni claves:

```bash
dotnet user-secrets init --project src/Web
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..." --project src/Web
dotnet user-secrets list --project src/Web
```

## Testing

```bash
dotnet new xunit -n Tests.Application -o tests/Tests.Application               # Crear proyecto de tests
dotnet test
dotnet test --filter "FullyQualifiedName~ProductService"
```
