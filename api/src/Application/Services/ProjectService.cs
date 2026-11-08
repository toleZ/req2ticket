using System.Text.RegularExpressions;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;

namespace Application.Services;

public partial class ProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;

    public ProjectService(IProjectRepository projectRepository, IUserRepository userRepository)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
    }

    public async Task<List<ProjectListItem>> GetForUserAsync(int userId, bool includeArchived)
    {
        User? user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return [];
        }

        return await _projectRepository.GetForUserAsync(
            userId,
            user.PlatformRole == PlatformRole.SuperAdmin,
            includeArchived);
    }

    public async Task<Project?> GetByIdAsync(int projectId) =>
        await _projectRepository.GetByIdAsync(projectId);

    /* Whoever creates a project becomes its Admin. The membership is added to the project's own
       list, so EF inserts both rows in one SaveChanges: a project can never exist without its Admin,
       even if the request dies halfway. */
    public async Task<Project> CreateAsync(int creatorId, string key, string name, string? description)
    {
        string normalizedKey = key.Trim().ToUpperInvariant();

        if (!KeyPattern().IsMatch(normalizedKey))
        {
            throw new ArgumentException("The key must be 2 to 6 characters: a letter, then letters or digits.");
        }

        // Check-then-act: the unique index is the real guarantee, this is the readable message.
        if (await _projectRepository.KeyExistsAsync(normalizedKey))
        {
            throw new ArgumentException($"Project key '{normalizedKey}' is already in use.");
        }

        var project = new Project
        {
            Key = normalizedKey,
            Name = name.Trim(),
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            Members = [new ProjectMember { UserId = creatorId, Role = ProjectRole.Admin }]
        };

        await _projectRepository.AddAsync(project);
        return project;
    }

    // Name and description only. The key is immutable and is never read from the request.
    public async Task<bool> UpdateAsync(int projectId, string name, string? description)
    {
        Project? project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null)
        {
            return false;
        }

        project.Name = name.Trim();
        project.Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();

        await _projectRepository.UpdateAsync(project);
        return true;
    }

    public async Task<bool> SetArchivedAsync(int projectId, bool archived)
    {
        Project? project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null)
        {
            return false;
        }

        if (archived && project.ArchivedAt is null)
        {
            project.ArchivedAt = DateTimeOffset.UtcNow;
        }
        else if (!archived)
        {
            project.ArchivedAt = null;
        }

        await _projectRepository.UpdateAsync(project);
        return true;
    }

    // Physical delete, SuperAdmin only. The database cascades: members, workflow, epics, sprints
    // and tickets go with the project.
    public async Task<bool> DeleteAsync(int projectId)
    {
        Project? project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null)
        {
            return false;
        }

        await _projectRepository.DeleteAsync(projectId);
        return true;
    }

    // A letter first, then letters or digits: "R2T" has to be a valid key.
    [GeneratedRegex("^[A-Z][A-Z0-9]{1,5}$")]
    private static partial Regex KeyPattern();
}
