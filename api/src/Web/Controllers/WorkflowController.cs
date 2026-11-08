using Application.Services;
using Domain.Common;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

// The project's workflow (ENT-3). Optional: null means tickets move freely.
[Route("api/projects/{pid:int}/workflow")]
[ApiController]
[RequireProjectMember]
public class WorkflowController : ControllerBase
{
    private readonly WorkflowService _workflowService;

    public WorkflowController(WorkflowService workflowService)
    {
        _workflowService = workflowService;
    }

    // 200 with the workflow, or 200 with null — not a 404, because "no workflow" is a valid state.
    // JsonResult and not Ok(null): Ok(null) would answer 204 with no body.
    [HttpGet]
    public async Task<IActionResult> Get([FromRoute] int pid)
    {
        Workflow? workflow = await _workflowService.GetAsync(pid);
        return new JsonResult(workflow is null ? null : WorkflowResponse.FromEntity(workflow));
    }

    // Creates it or replaces it whole.
    [RequireProjectPermission(Permission.WorkflowEdit)]
    [HttpPut]
    public async Task<IActionResult> Replace([FromRoute] int pid, [FromBody] WorkflowRequest request)
    {
        Workflow workflow = await _workflowService.ReplaceAsync(
            pid,
            request.Transitions.Select(t => (t.From!.Value, t.To!.Value)).ToList());

        return Ok(WorkflowResponse.FromEntity(workflow));
    }

    // Back to moving freely.
    [RequireProjectPermission(Permission.WorkflowEdit)]
    [HttpDelete]
    public async Task<IActionResult> Delete([FromRoute] int pid)
    {
        bool deleted = await _workflowService.DeleteAsync(pid);
        return deleted ? NoContent() : NotFound();
    }
}
