using Application.Services;
using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

// The list returns light summaries with their counts; the detail adds the description (DATA-1).
[Route("api/projects/{pid:int}/epics")]
[ApiController]
[RequireProjectMember]
public class EpicsController : ControllerBase
{
    private readonly EpicService _epicService;

    public EpicsController(EpicService epicService)
    {
        _epicService = epicService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromRoute] int pid) =>
        Ok(await _epicService.GetSummariesAsync(pid));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int pid, [FromRoute] int id)
    {
        EpicDetailResponse? detail = await BuildDetailAsync(pid, await _epicService.GetDetailAsync(pid, id));
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode([FromRoute] int pid, [FromRoute] string code)
    {
        EpicDetailResponse? detail = await BuildDetailAsync(pid, await _epicService.GetByCodeAsync(pid, code));
        return detail is null ? NotFound() : Ok(detail);
    }

    [RequireProjectPermission(Permission.EpicsManage)]
    [HttpPost]
    public async Task<IActionResult> Create([FromRoute] int pid, [FromBody] EpicWriteRequest request)
    {
        Epic created = await _epicService.CreateAsync(pid, request.ToEntity());
        EpicDetailResponse detail = (await BuildDetailAsync(pid, await _epicService.GetDetailAsync(pid, created.Id)))!;
        return CreatedAtAction(nameof(GetById), new { pid, id = created.Id }, detail);
    }

    // Answers with the detail as saved, so the client never needs a second GET.
    [RequireProjectPermission(Permission.EpicsManage)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int pid, [FromRoute] int id, [FromBody] EpicWriteRequest request)
    {
        bool updated = await _epicService.UpdateAsync(pid, id, request.ToEntity());
        if (!updated)
        {
            return NotFound();
        }

        return Ok(await BuildDetailAsync(pid, await _epicService.GetDetailAsync(pid, id)));
    }

    // Takes its tickets with it.
    [RequireProjectPermission(Permission.EpicsManage)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int pid, [FromRoute] int id)
    {
        bool deleted = await _epicService.DeleteAsync(pid, id);
        return deleted ? NoContent() : NotFound();
    }

    private async Task<EpicDetailResponse?> BuildDetailAsync(int projectId, Epic? epic)
    {
        if (epic is null)
        {
            return null;
        }

        EpicSummary summary = (await _epicService.GetSummaryAsync(projectId, epic.Id))!;
        return EpicDetailResponse.From(epic, summary);
    }
}
