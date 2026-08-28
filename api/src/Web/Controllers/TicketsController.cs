using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

// Reading only needs a valid token, which the fallback policy in Program.cs already demands.
// Writing carries an explicit policy, so a Viewer gets 403 instead of changing the backlog.
[Route("api/[controller]")]
[ApiController]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<Ticket> tickets = await _ticketService.GetAllAsync();
        return Ok(tickets.Select(TicketResponse.FromEntity));
    }

    // The backlog is the tickets that are not planned into any sprint. It lives here and
    // not under /api/sprints because there is no sprint to hang it from.
    [HttpGet("backlog")]
    public async Task<IActionResult> GetBacklog()
    {
        List<Ticket> tickets = await _ticketService.GetBySprintIdAsync(null);
        return Ok(tickets.Select(TicketResponse.FromEntity));
    }

    // The :int constraint keeps /api/tickets/abc from matching and failing model binding
    // with a 400; without it, a bad id looks like a validation error instead of a 404.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        Ticket? ticket = await _ticketService.GetByIdAsync(id);
        if (ticket is null)
        {
            return NotFound();
        }

        return Ok(TicketResponse.FromEntity(ticket));
    }

    // The "se divide en" side of the self-relation: what this ticket was split into.
    [HttpGet("{id:int}/children")]
    public async Task<IActionResult> GetChildren([FromRoute] int id)
    {
        Ticket? ticket = await _ticketService.GetByIdAsync(id);
        if (ticket is null)
        {
            return NotFound();
        }

        List<Ticket> children = await _ticketService.GetChildrenAsync(id);
        return Ok(children.Select(TicketResponse.FromEntity));
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode([FromRoute] string code)
    {
        Ticket? ticket = await _ticketService.GetByCodeAsync(code);
        if (ticket is null)
        {
            return NotFound();
        }

        return Ok(TicketResponse.FromEntity(ticket));
    }

    [Authorize(Policy = "CanEditTickets")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TicketCreateRequest request)
    {
        try
        {
            Ticket ticket = request.ToEntity();

            // Jira fills the reporter with whoever pressed the button. Done here and not in
            // TicketService because "who is logged in" is an HTTP fact, and Application has
            // no HttpContext and should not grow one. ??= so an explicit reporterId wins.
            ticket.ReporterId ??= CurrentUserId();

            Ticket created = await _ticketService.CreateAsync(ticket);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, TicketResponse.FromEntity(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "CanEditTickets")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] TicketUpdateRequest request)
    {
        try
        {
            bool updated = await _ticketService.UpdateAsync(id, request.ToEntity());
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "CanEditTickets")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        bool deleted = await _ticketService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    // TokenService writes the user id into "sub", and Program.cs turns off inbound claim
    // mapping, so it arrives spelled exactly like that instead of as a SOAP-era URI.
    private int? CurrentUserId() =>
        int.TryParse(User.FindFirst("sub")?.Value, out int id) ? id : null;
}
