using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

// Literal route instead of [controller], which would render as api/Auth in the OpenAPI document.
[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        User? user = await _authService.LoginAsync(request.Email, request.Password);
        if (user is null)
        {
            // Unauthorized(object) returns this body as-is rather than a ProblemDetails,
            // which is the { message } shape the front end already knows how to read.
            return Unauthorized(new { message = "Email o contraseña incorrectos." });
        }

        return Ok(UserResponse.FromEntity(user));
    }
}
