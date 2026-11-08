using Application.Services;
using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

/* Sprints of a project (ENT-5). The PUT edits the data; the status only moves through /start and
   /complete. Every write answers with the sprint's summary as saved, counts included. */
[Route("api/projects/{pid:int}/sprints")]
[ApiController]
[RequireProjectMember]
public class SprintsController : ControllerBase
{
    private readonly SprintService _sprintService;

    public SprintsController(SprintService sprintService)
    {
        _sprintService = sprintService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromRoute] int pid) =>
        Ok(await _sprintService.GetSummariesAsync(pid));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int pid, [FromRoute] int id)
    {
        SprintSummary? sprint = await _sprintService.GetSummaryAsync(pid, id);
        return sprint is null ? NotFound() : Ok(sprint);
    }

    [RequireProjectPermission(Permission.SprintsManage)]
    [HttpPost]
    public async Task<IActionResult> Create([FromRoute] int pid, [FromBody] SprintWriteRequest request)
    {
        Sprint created = await _sprintService.CreateAsync(pid, request.ToEntity());
        return CreatedAtAction(nameof(GetById), new { pid, id = created.Id }, await _sprintService.GetSummaryAsync(pid, created.Id));
    }

    [RequireProjectPermission(Permission.SprintsManage)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int pid, [FromRoute] int id, [FromBody] SprintWriteRequest request)
    {
        bool updated = await _sprintService.UpdateAsync(pid, id, request.ToEntity());
        return updated ? Ok(await _sprintService.GetSummaryAsync(pid, id)) : NotFound();
    }

    [RequireProjectPermission(Permission.SprintsManage)]
    [HttpPost("{id:int}/start")]
    public async Task<IActionResult> Start([FromRoute] int pid, [FromRoute] int id)
    {
        bool started = await _sprintService.StartAsync(pid, id);
        return started ? Ok(await _sprintService.GetSummaryAsync(pid, id)) : NotFound();
    }

    // The body may be empty: then the open tickets go back to the backlog.
    [RequireProjectPermission(Permission.SprintsManage)]
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete([FromRoute] int pid, [FromRoute] int id, [FromBody] SprintCompleteRequest? request)
    {
        int? moved = await _sprintService.CompleteAsync(pid, id, request?.MoveOpenTicketsTo);
        if (moved is null)
        {
            return NotFound();
        }

        return Ok(new SprintCompleteResponse((await _sprintService.GetSummaryAsync(pid, id))!, moved.Value));
    }

    [RequireProjectPermission(Permission.SprintsManage)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int pid, [FromRoute] int id)
    {
        bool deleted = await _sprintService.DeleteAsync(pid, id);
        return deleted ? NoContent() : NotFound();
    }
}
