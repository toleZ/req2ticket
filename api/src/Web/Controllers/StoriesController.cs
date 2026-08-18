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
public class StoriesController : ControllerBase
{
    private readonly StoryService _storyService;

    public StoriesController(StoryService storyService)
    {
        _storyService = storyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<Story> stories = await _storyService.GetAllAsync();
        return Ok(stories.Select(StoryResponse.FromEntity));
    }

    // The backlog is the stories that are not planned into any sprint. It lives here and
    // not under /api/sprints because there is no sprint to hang it from.
    [HttpGet("backlog")]
    public async Task<IActionResult> GetBacklog()
    {
        List<Story> stories = await _storyService.GetBySprintIdAsync(null);
        return Ok(stories.Select(StoryResponse.FromEntity));
    }

    // The :int constraint keeps /api/stories/abc from matching and failing model binding
    // with a 400; without it, a bad id looks like a validation error instead of a 404.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        Story? story = await _storyService.GetByIdAsync(id);
        if (story is null)
        {
            return NotFound();
        }

        return Ok(StoryResponse.FromEntity(story));
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode([FromRoute] string code)
    {
        Story? story = await _storyService.GetByCodeAsync(code);
        if (story is null)
        {
            return NotFound();
        }

        return Ok(StoryResponse.FromEntity(story));
    }

    [Authorize(Policy = "CanEditStories")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StoryCreateRequest request)
    {
        try
        {
            Story created = await _storyService.CreateAsync(request.ToEntity());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, StoryResponse.FromEntity(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "CanEditStories")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] StoryUpdateRequest request)
    {
        try
        {
            bool updated = await _storyService.UpdateAsync(id, request.ToEntity());
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

    [Authorize(Policy = "CanEditStories")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        bool deleted = await _storyService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
