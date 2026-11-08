using Domain.Interfaces;
using Domain.ReadModels;

namespace Application.Services;

/* Answers "what may this user do in this project" for the current request. The permission filters
   ask it before the action runs, and the controllers ask it again for myRole and myPermissions —
   the cache below makes the second ask free. Scoped, so the cache lives exactly one request and a
   role change shows up on the next one. */
public class ProjectAccessService
{
    private readonly IProjectRepository _projectRepository;
    private readonly Dictionary<(int ProjectId, int UserId), ProjectAccess?> _cache = [];

    public ProjectAccessService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    // Null: the project does not exist, or the user is neither a member nor a SuperAdmin.
    public async Task<ProjectAccess?> GetAsync(int projectId, int userId)
    {
        if (_cache.TryGetValue((projectId, userId), out ProjectAccess? cached))
        {
            return cached;
        }

        ProjectAccess? access = await _projectRepository.GetAccessAsync(projectId, userId);
        _cache[(projectId, userId)] = access;
        return access;
    }

    // After the request itself changed the project (archived it, for instance), the cached answer
    // is stale: read it again.
    public async Task<ProjectAccess?> RefreshAsync(int projectId, int userId)
    {
        _cache.Remove((projectId, userId));
        return await GetAsync(projectId, userId);
    }
}
