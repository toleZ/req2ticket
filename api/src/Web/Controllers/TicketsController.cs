using Application.Services;
using Domain.Common;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

/* Tickets of a project. The list is light (TicketSummary); the detail carries the description, the
   type's fields and the children (DATA-1). Writes answer with the detail as saved, so the client
   never needs a second GET. */
[Route("api/projects/{pid:int}/tickets")]
[ApiController]
[RequireProjectMember]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;
    private readonly CurrentUser _currentUser;

    public TicketsController(TicketService ticketService, CurrentUser currentUser)
    {
        _ticketService = ticketService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromRoute] int pid) =>
        Ok(await _ticketService.GetSummariesAsync(pid));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int pid, [FromRoute] int id)
    {
        TicketDetailView? view = await _ticketService.GetDetailAsync(pid, id);
        return view is null ? NotFound() : Ok(TicketDetailResponse.From(view));
    }

    // R2T-UH-12, or uh-12 written by hand: the service normalizes the case.
    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode([FromRoute] int pid, [FromRoute] string code)
    {
        TicketDetailView? view = await _ticketService.GetByCodeAsync(pid, code);
        return view is null ? NotFound() : Ok(TicketDetailResponse.From(view));
    }

    [RequireProjectPermission(Permission.TicketsWrite)]
    [HttpPost]
    public async Task<IActionResult> Create([FromRoute] int pid, [FromBody] TicketWriteRequest request)
    {
        Ticket created = await _ticketService.CreateAsync(pid, _currentUser.Id, request.ToEntity());
        TicketDetailView view = (await _ticketService.GetDetailAsync(pid, created.Id))!;
        return CreatedAtAction(nameof(GetById), new { pid, id = created.Id }, TicketDetailResponse.From(view));
    }

    [RequireProjectPermission(Permission.TicketsWrite)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int pid, [FromRoute] int id, [FromBody] TicketWriteRequest request)
    {
        bool updated = await _ticketService.UpdateAsync(pid, id, request.ToEntity());
        if (!updated)
        {
            return NotFound();
        }

        return Ok(TicketDetailResponse.From((await _ticketService.GetDetailAsync(pid, id))!));
    }

    // The one way to change status: the detail's selector and the board both use it.
    [RequireProjectPermission(Permission.TicketsWrite)]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> ChangeStatus([FromRoute] int pid, [FromRoute] int id, [FromBody] TicketStatusRequest request)
    {
        bool changed = await _ticketService.ChangeStatusAsync(pid, id, request.Status!.Value);
        if (!changed)
        {
            return NotFound();
        }

        return Ok(TicketDetailResponse.From((await _ticketService.GetDetailAsync(pid, id))!));
    }
    // Takes every descendant with it.
    [RequireProjectPermission(Permission.TicketsDelete)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int pid, [FromRoute] int id)
    {
        bool deleted = await _ticketService.DeleteAsync(pid, id);
        return deleted ? NoContent() : NotFound();
    }
}
