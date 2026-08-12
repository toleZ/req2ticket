using System.ComponentModel.DataAnnotations;

namespace Web.DTOs;

// Unlike LoginRequest, this one validates format on purpose. There a 400 would leak that
// the request never reached the credential check; here a malformed email or a short
// password IS a validation error, and 400 is the right answer.
public record RegisterRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 80 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress(ErrorMessage = "El email no tiene un formato válido.")]
    [StringLength(120, ErrorMessage = "El email no puede superar los 120 caracteres.")]
    public string Email { get; init; } = string.Empty;

    // The upper bound is BCrypt's: it silently ignores everything past 72 bytes, so a
    // longer password would be accepted and then only partly checked.
    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(72, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 72 caracteres.")]
    public string Password { get; init; } = string.Empty;
}
