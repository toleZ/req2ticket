using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

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
}
