using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

// Reading users only needs a valid token, which the fallback policy in Program.cs already
// demands. Writing them carries the CanManageUsers policy. Its 403 and the service's say
// different things: the policy stops you because you do not administer users at all, the
// service because you do not outrank this particular one.
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<User> users = await _userService.GetAllAsync();
        return Ok(users.Select(UserResponse.FromEntity));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        User? user = await _userService.GetByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(UserResponse.FromEntity(user));
    }

    [Authorize(Policy = "CanManageUsers")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserCreateRequest request)
    {
        try
        {
            User created = await _userService.CreateAsync(CurrentUserId(), request.ToEntity(), request.Password);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, UserResponse.FromEntity(created));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbidden(ex);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "CanManageUsers")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UserUpdateRequest request)
    {
        try
        {
            bool updated = await _userService.UpdateAsync(id, CurrentUserId(), request.ToEntity(), request.Password);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbidden(ex);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Unlike the other controllers, this DELETE carries a try: deleting a user can be forbidden
    // — yourself, a peer, the last superAdmin — even when the id exists.
    [Authorize(Policy = "CanManageUsers")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        try
        {
            bool deleted = await _userService.DeleteAsync(id, CurrentUserId());
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbidden(ex);
        }
    }

    // The service throws UnauthorizedAccessException to say "not your rank for this target".
    // Nothing maps it on its own, so it would surface as a 500 if this helper went away.
    //
    // StatusCode and not Forbid(): Forbid() answers 403 with no body, and the message is the
    // only thing telling this 403 apart from the policy's.
    private IActionResult Forbidden(UnauthorizedAccessException ex)
    {
        return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
    }

    // Same helper as TicketsController: "sub" arrives unmapped, see Program.cs.
    // Null means the token carried no usable id, and the service decides what that costs.
    private int? CurrentUserId()
    {
        string? sub = User.FindFirst("sub")?.Value;
        if (int.TryParse(sub, out int id))
        {
            return id;
        }

        return null;
    }
}
