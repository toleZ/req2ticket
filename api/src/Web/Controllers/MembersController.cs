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

    public MembersController(MemberService memberService)
    {
        _memberService = memberService;
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
}
