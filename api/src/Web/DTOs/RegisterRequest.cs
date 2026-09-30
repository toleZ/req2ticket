using System.ComponentModel.DataAnnotations;

namespace Web.DTOs;

// Unlike LoginRequest, this one validates format on purpose. There a 400 would leak that
// the request never reached the credential check; here a malformed email or a short
// password IS a validation error, and 400 is the right answer.
public record RegisterRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 80 characters.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not a valid address.")]
    [StringLength(120, ErrorMessage = "Email cannot exceed 120 characters.")]
    public string Email { get; init; } = string.Empty;

    // The upper bound is BCrypt's: it silently ignores everything past 72 bytes, so a
    // longer password would be accepted and then only partly checked.
    [Required(ErrorMessage = "Password is required.")]
    [StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 72 characters.")]
    public string Password { get; init; } = string.Empty;
}
