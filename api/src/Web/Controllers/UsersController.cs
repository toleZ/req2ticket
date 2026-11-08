using Application.Services;
using Domain.Common;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

/* The platform's user directory, SuperAdmin only. Everyone else meets users as members of a project
   (/api/projects/{pid}/members), which is where roles inside a project are managed. */
[Route("api/[controller]")]
[ApiController]
[RequirePlatformPermission(Permission.UsersManage)]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly CurrentUser _currentUser;

    public UsersController(UserService userService, CurrentUser currentUser)
    {
        _userService = userService;
        _currentUser = currentUser;
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
        return user is null ? NotFound() : Ok(UserResponse.FromEntity(user));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserCreateRequest request)
    {
        User created = await _userService.CreateAsync(request.ToEntity(), request.Password);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, UserResponse.FromEntity(created));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UserUpdateRequest request)
    {
        bool updated = await _userService.UpdateAsync(id, _currentUser.Id, request.ToEntity(), request.Password);
        if (!updated)
        {
            return NotFound();
        }

        User? user = await _userService.GetByIdAsync(id);
        return Ok(UserResponse.FromEntity(user!));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        bool deleted = await _userService.DeleteAsync(id, _currentUser.Id);
        return deleted ? NoContent() : NotFound();
    }
}
