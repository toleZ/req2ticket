using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EpicsController : ControllerBase
{
    private readonly EpicService _epicService;

    public EpicsController(EpicService epicService)
    {
        _epicService = epicService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<Epic> epics = await _epicService.GetAllAsync();
        return Ok(epics.Select(EpicResponse.FromEntity));
    }

    // The :int constraint keeps /api/epics/abc from matching and failing model binding
    // with a 400; without it, a bad id looks like a validation error instead of a 404.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        Epic? epic = await _epicService.GetByIdAsync(id);
        if (epic is null)
        {
            return NotFound();
        }

        return Ok(EpicResponse.FromEntity(epic));
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode([FromRoute] string code)
    {
        Epic? epic = await _epicService.GetByCodeAsync(code);
        if (epic is null)
        {
            return NotFound();
        }

        return Ok(EpicResponse.FromEntity(epic));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EpicCreateRequest request)
    {
        try
        {
            Epic created = await _epicService.CreateAsync(request.ToEntity());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, EpicResponse.FromEntity(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] EpicUpdateRequest request)
    {
        try
        {
            bool updated = await _epicService.UpdateAsync(id, request.ToEntity());
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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        bool deleted = await _epicService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
