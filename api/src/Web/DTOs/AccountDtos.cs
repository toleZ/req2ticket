using System.ComponentModel.DataAnnotations;
using Domain.Common;
using Domain.Entities;
using System.Text.Json.Serialization;
using Web.DTOs.Validation;

namespace Web.DTOs;

/* Signing in, signing up, the caller's own account (/api/me) and the platform's user directory
   (/api/users, SuperAdmin only).

   A note that applies to every request DTO: nullable enum properties repeat
   [JsonConverter(typeof(StringOnlyEnumConverter<T>))]. System.Text.Json does not look at the enum
   type's own attribute for Nullable<T>, falls back to the default converter, and that one accepts
   integers — "role": 1 would quietly bind. Repeating it on the property is what turns that off. */

public record LoginRequest
{
    // Only [Required]: a format rule here would turn a failed login into a 400 instead of the 401
    // the front end expects, and it would hint at which part was wrong.
    [Required(ErrorMessage = "Email is required.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; init; } = string.Empty;
}

public record RegisterRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 80 characters.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not valid.")]
    [StringLength(120, ErrorMessage = "Email can't be longer than 120 characters.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [StrongPassword]
    public string Password { get; init; } = string.Empty;
}

// ExpiresAt travels so the front end can tell an expired session from a rejected one without
// decoding the token. UTC, like everything the API returns.
public record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);

// No PasswordHash, ever. Shared by the login, /api/me and /api/users.
public record UserResponse(int Id, string Name, string Email, PlatformRole PlatformRole)
{
    public static UserResponse FromEntity(User user) => new(user.Id, user.Name, user.Email, user.PlatformRole);
}

// The email is not editable for now: it is what people use to add you to their projects.
public record MeUpdateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 80 characters.")]
    public string Name { get; init; } = string.Empty;
}

public record ChangePasswordRequest
{
    [Required(ErrorMessage = "Current password is required.")]
    public string CurrentPassword { get; init; } = string.Empty;

    [Required(ErrorMessage = "New password is required.")]
    [StrongPassword]
    public string NewPassword { get; init; } = string.Empty;
}

// Creating a user on someone's behalf (SuperAdmin), not a public sign-up.
public record UserCreateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 80 characters.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not valid.")]
    [StringLength(120, ErrorMessage = "Email can't be longer than 120 characters.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [StrongPassword]
    public string Password { get; init; } = string.Empty;

    [JsonConverter(typeof(StringOnlyEnumConverter<PlatformRole>))]
    [EnumDataType(typeof(PlatformRole), ErrorMessage = "Platform role is not valid.")]
    public PlatformRole? PlatformRole { get; init; }

    public User ToEntity() => new()
    {
        Name = Name,
        Email = Email,
        PlatformRole = PlatformRole ?? Domain.Entities.PlatformRole.User
    };
}

// Full replacement, except the password: absent means "leave it as it is".
public record UserUpdateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 80 characters.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not valid.")]
    [StringLength(120, ErrorMessage = "Email can't be longer than 120 characters.")]
    public string Email { get; init; } = string.Empty;

    [StrongPassword]
    public string? Password { get; init; }

    [Required(ErrorMessage = "Platform role is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<PlatformRole>))]
    [EnumDataType(typeof(PlatformRole), ErrorMessage = "Platform role is not valid.")]
    public PlatformRole? PlatformRole { get; init; }

    public User ToEntity() => new()
    {
        Name = Name,
        Email = Email,
        PlatformRole = PlatformRole ?? Domain.Entities.PlatformRole.User
    };
}
