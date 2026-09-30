using System.ComponentModel.DataAnnotations;

namespace Web.DTOs;

public record LoginRequest
{
    // Only [Required] on purpose. [ApiController] short-circuits the pipeline before the
    // action whenever ModelState is invalid, so any format rule here would turn a failed
    // login into a 400 instead of the 401 the front end expects. The email format is
    // already checked by web/src/lib/validate.js.
    [Required(ErrorMessage = "Email is required.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; init; } = string.Empty;
}
