using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ProjectRepository : BaseRepository<Project>, IProjectRepository
{
    public ProjectRepository(Req2TicketContext context) : base(context)
    {
    }

    public async Task<bool> KeyExistsAsync(string key) =>
        await _dbSet.AnyAsync(p => p.Key == key);

    public async Task<bool> AnyAsync() =>
        await _dbSet.AnyAsync();

    public async Task<List<ProjectListItem>> GetForUserAsync(int userId, bool isSuperAdmin, bool includeArchived)
    {
        IQueryable<Project> projects = _dbSet.AsNoTracking();

        if (!includeArchived)
        {
            projects = projects.Where(p => p.ArchivedAt == null);
        }

        if (!isSuperAdmin)
        {
            projects = projects.Where(p => p.Members.Any(m => m.UserId == userId));
        }

        return await projects
            .OrderBy(p => p.Name)
            .ThenBy(p => p.Id)
            .Select(p => new ProjectListItem(
                p.Id,
                p.Key,
                p.Name,
                p.Description,
                p.ArchivedAt,
                p.CreatedAt,
                p.Members.Where(m => m.UserId == userId).Select(m => (ProjectRole?)m.Role).FirstOrDefault(),
                p.Members.Count(),
                p.Members.Count(m => m.Role == ProjectRole.Admin)))
            .ToListAsync();
    }

    /* Two small queries instead of one clever one: the user's platform role, then the project with
       the user's membership. Run once per request (ProjectAccessService caches it). The platform
       role is read from the database and not from the token, so a demotion takes effect on the
       next request instead of when the token expires. */
    public async Task<ProjectAccess?> GetAccessAsync(int projectId, int userId)
    {
        PlatformRole? platformRole = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => (PlatformRole?)u.PlatformRole)
            .FirstOrDefaultAsync();

        if (platformRole is null)
        {
            return null;
        }

        var project = await _dbSet
            .AsNoTracking()
            .Where(p => p.Id == projectId)
            .Select(p => new
            {
                p.Key,
                p.ArchivedAt,
                Role = p.Members.Where(m => m.UserId == userId).Select(m => (ProjectRole?)m.Role).FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (project is null)
        {
            return null;
        }

        // Not a member and not a SuperAdmin: the same answer as a project that does not exist, so
        // the API never reveals which project ids are in use.
        if (project.Role is null && platformRole != PlatformRole.SuperAdmin)
        {
            return null;
        }

        return new ProjectAccess(projectId, project.Key, project.ArchivedAt is not null, project.Role, platformRole.Value);
    }

    /* One statement increments the counter and returns the value it had, so two requests can never
       read the same number: the second waits on the row lock until the first commits. The column
       name comes from a closed switch, never from input, so formatting it into the SQL is safe. */
    public async Task<int> TakeNextNumberAsync(int projectId, NumberedKind kind)
    {
        string column = kind switch
        {
            NumberedKind.Epic => nameof(Project.NextEpicNumber),
            NumberedKind.UserStory => nameof(Project.NextUserStoryNumber),
            NumberedKind.Task => nameof(Project.NextTaskNumber),
            NumberedKind.Bug => nameof(Project.NextBugNumber),
            NumberedKind.Fix => nameof(Project.NextFixNumber),
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, "Unknown sequence.")
        };

        // ToListAsync and not FirstAsync: composing on top of raw SQL wraps it in a subquery, and
        // PostgreSQL does not allow an UPDATE inside one.
        List<int> taken = await _context.Database
            .SqlQueryRaw<int>(
                $"UPDATE \"Projects\" SET \"{column}\" = \"{column}\" + 1 WHERE \"Id\" = {{0}} RETURNING \"{column}\" - 1 AS \"Value\"",
                projectId)
            .ToListAsync();

        return taken.Count == 1
            ? taken[0]
            : throw new InvalidOperationException($"Project {projectId} does not exist.");
    }
}
