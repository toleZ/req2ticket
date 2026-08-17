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
public class SprintsController : ControllerBase
{
    private readonly SprintService _sprintService;

    public SprintsController(SprintService sprintService)
    {
        _sprintService = sprintService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<Sprint> sprints = await _sprintService.GetAllAsync();
        return Ok(sprints.Select(SprintResponse.FromEntity));
    }

    // The :int constraint keeps /api/sprints/abc from matching and failing model binding
    // with a 400; without it, a bad id looks like a validation error instead of a 404.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        Sprint? sprint = await _sprintService.GetByIdAsync(id);
        if (sprint is null)
        {
            return NotFound();
        }

        return Ok(SprintResponse.FromEntity(sprint));
    }

    [Authorize(Policy = "CanEditSprints")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SprintCreateRequest request)
    {
        try
        {
            Sprint created = await _sprintService.CreateAsync(request.ToEntity());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, SprintResponse.FromEntity(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "CanEditSprints")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] SprintUpdateRequest request)
    {
        try
        {
            bool updated = await _sprintService.UpdateAsync(id, request.ToEntity());
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

    [Authorize(Policy = "CanEditSprints")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        bool deleted = await _sprintService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
