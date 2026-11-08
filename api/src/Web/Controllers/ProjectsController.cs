using Application.Services;
using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

// Projects themselves (ENT-1, PAGE-2). Everything inside one lives under /api/projects/{pid}/….
[Route("api/projects")]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService _projectService;
    private readonly ProjectAccessService _accessService;
    private readonly CurrentUser _currentUser;

    public ProjectsController(ProjectService projectService, ProjectAccessService accessService, CurrentUser currentUser)
    {
        _projectService = projectService;
        _accessService = accessService;
        _currentUser = currentUser;
    }

    // My projects (every project for a SuperAdmin). ?includeArchived=true adds the archived ones.
    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] bool includeArchived = false)
    {
        List<ProjectListItem> projects = await _projectService.GetForUserAsync(_currentUser.Id, includeArchived);
        return Ok(projects.Select(ProjectListResponse.FromReadModel));
    }

    // Anyone can create a project and becomes its Admin.
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProjectCreateRequest request)
    {
        Project created = await _projectService.CreateAsync(_currentUser.Id, request.Key, request.Name, request.Description);
        return CreatedAtAction(nameof(GetById), new { pid = created.Id }, await BuildResponseAsync(created.Id));
    }

    [RequireProjectMember]
    [HttpGet("{pid:int}")]
    public async Task<IActionResult> GetById([FromRoute] int pid) =>
        Ok(await BuildResponseAsync(pid));

    [RequireProjectPermission(Permission.ProjectEdit)]
    [HttpPut("{pid:int}")]
    public async Task<IActionResult> Update([FromRoute] int pid, [FromBody] ProjectUpdateRequest request)
    {
        await _projectService.UpdateAsync(pid, request.Name, request.Description);
        return Ok(await BuildResponseAsync(pid));
    }

    [RequireProjectPermission(Permission.ProjectArchive)]
    [HttpPost("{pid:int}/archive")]
    public async Task<IActionResult> Archive([FromRoute] int pid)
    {
        await _projectService.SetArchivedAsync(pid, archived: true);
        return Ok(await BuildResponseAsync(pid));
    }

    [RequireProjectPermission(Permission.ProjectArchive)]
    [HttpPost("{pid:int}/unarchive")]
    public async Task<IActionResult> Unarchive([FromRoute] int pid)
    {
        await _projectService.SetArchivedAsync(pid, archived: false);
        return Ok(await BuildResponseAsync(pid));
    }

    // Physical delete, SuperAdmin only. Everything in the project goes with it.
    [RequireProjectPermission(Permission.ProjectsDelete)]
    [HttpDelete("{pid:int}")]
    public async Task<IActionResult> Delete([FromRoute] int pid)
    {
        bool deleted = await _projectService.DeleteAsync(pid);
        return deleted ? NoContent() : NotFound();
    }

    // Read fresh after every change, so ArchivedAt and the permissions always match the database.
    private async Task<ProjectResponse> BuildResponseAsync(int projectId)
    {
        Project project = (await _projectService.GetByIdAsync(projectId))!;
        ProjectAccess access = (await _accessService.RefreshAsync(projectId, _currentUser.Id))!;

        return ProjectResponse.FromEntity(project, access);
    }
}
