using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Web.DTOs;

namespace Web.Controllers;

// Literal route instead of [controller], which would render as api/Auth in the OpenAPI document.
[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly TokenService _tokenService;

    public AuthController(AuthService authService, TokenService tokenService)
    {
        _authService = authService;
        _tokenService = tokenService;
    }

    // [AllowAnonymous] is what makes this reachable: Program.cs sets a fallback policy that
    // demands a token everywhere else, so without it logging in would require being logged in.
    [AllowAnonymous]
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

        return Ok(BuildAuthResponse(user));
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            User created = await _authService.RegisterAsync(request.Name, request.Email, request.Password);

            // Returns a token so registering leaves the caller logged in, like the login
            // endpoint does. The account starts as Viewer: it can read, not write.
            return Ok(BuildAuthResponse(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        (string token, DateTime expiresAt) = _tokenService.Create(user);
        return new AuthResponse(token, expiresAt, UserResponse.FromEntity(user));
    }
}
