using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.Authorization;
using Web.DTOs;

namespace Web.Controllers;

// The caller's own account: who am I, change my name, change my password (PAGE-2).
[Route("api/me")]
[ApiController]
public class MeController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;
    private readonly CurrentUser _currentUser;

    public MeController(AuthService authService, UserService userService, CurrentUser currentUser)
    {
        _authService = authService;
        _userService = userService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        User? user = await _userService.GetByIdAsync(_currentUser.Id);
        return user is null ? Unauthorized() : Ok(UserResponse.FromEntity(user));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] MeUpdateRequest request)
    {
        User? user = await _authService.UpdateNameAsync(_currentUser.Id, request.Name);
        return user is null ? Unauthorized() : Ok(UserResponse.FromEntity(user));
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        bool changed = await _authService.ChangePasswordAsync(_currentUser.Id, request.CurrentPassword, request.NewPassword);
        return changed ? NoContent() : Unauthorized();
    }
}
