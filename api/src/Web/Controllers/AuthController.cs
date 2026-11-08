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

    // [AllowAnonymous] because the fallback policy demands a token everywhere else.
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        User? user = await _authService.LoginAsync(request.Email, request.Password);
        if (user is null)
        {
            return Unauthorized(new { message = "Wrong email or password." });
        }

        return Ok(BuildAuthResponse(user));
    }

    // Registering leaves the caller logged in, with no projects yet: they create one or get added.
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        User created = await _authService.RegisterAsync(request.Name, request.Email, request.Password);
        return Ok(BuildAuthResponse(created));
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        (string token, DateTime expiresAt) = _tokenService.Create(user);
        return new AuthResponse(token, expiresAt, UserResponse.FromEntity(user));
    }
}
