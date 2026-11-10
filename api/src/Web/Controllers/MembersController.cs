using Application.Services;
using Domain.Common;
using Domain.ReadModels;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

// The team of a project (PAGE-1). Seeing it only takes being a member; changing it, members.manage.
[Route("api/projects/{pid:int}/members")]
[ApiController]
[RequireProjectMember]
public class MembersController : ControllerBase
{
    private readonly MemberService _memberService;
    private readonly ProjectAccessService _accessService;
    private readonly CurrentUser _currentUser;

    public MembersController(MemberService memberService, ProjectAccessService accessService, CurrentUser currentUser)
    {
        _memberService = memberService;
        _accessService = accessService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromRoute] int pid) =>
        Ok(await _memberService.GetAllAsync(pid));

    [RequireProjectPermission(Permission.MembersManage)]
    [HttpPost]
    public async Task<IActionResult> Add([FromRoute] int pid, [FromBody] MemberAddRequest request)
    {
        MemberSummary member = await _memberService.AddAsync(pid, request.Email, request.Role!.Value);
        return StatusCode(StatusCodes.Status201Created, member);
    }

    [RequireProjectPermission(Permission.MembersManage)]
    [HttpPut("{userId:int}")]
    public async Task<IActionResult> ChangeRole([FromRoute] int pid, [FromRoute] int userId, [FromBody] MemberRoleRequest request)
    {
        MemberSummary? member = await _memberService.ChangeRoleAsync(pid, userId, request.Role!.Value);
        return member is null ? NotFound() : Ok(member);
    }

    [RequireProjectPermission(Permission.MembersManage)]
    [HttpDelete("{userId:int}")]
    public async Task<IActionResult> Remove([FromRoute] int pid, [FromRoute] int userId)
    {
        bool removed = await _memberService.RemoveAsync(pid, userId);
        return removed ? NoContent() : NotFound();
    }

    /* Leaving the project: any member may, except its last Admin (MemberService refuses that).
       No permission to check, so the filter does not look at archiving — this does, because
       leaving changes the project too (it unassigns your tickets). */
    [HttpDelete("me")]
    public async Task<IActionResult> Leave([FromRoute] int pid)
    {
        ProjectAccess? access = await _accessService.GetAsync(pid, _currentUser.Id);
        if (access is { IsArchived: true })
        {
            return BadRequest(new { message = "Project is archived." });
        }

        bool removed = await _memberService.RemoveAsync(pid, _currentUser.Id);
        return removed ? NoContent() : NotFound();
    }
}
