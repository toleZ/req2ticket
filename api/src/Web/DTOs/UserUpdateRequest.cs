using Domain.Common;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Web.DTOs;

// PUT is a full replacement, same as epics, sprints and tickets. Password is the exception: the
// client never receives it, so it could not send it back unchanged even if it wanted to. Sending
// it resets the password, omitting it leaves it alone.
public record UserUpdateRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 80 caracteres.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress(ErrorMessage = "El email no tiene un formato válido.")]
    [StringLength(120, ErrorMessage = "El email no puede superar los 120 caracteres.")]
    public string Email { get; init; } = string.Empty;

    // No [Required]: absent means "leave it as it is".
    [StringLength(72, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 72 caracteres.")]
    public string? Password { get; init; }

    // See UserCreateRequest for why the converter is repeated on the property.
    [Required(ErrorMessage = "El rol es obligatorio.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<UserRole>))]
    [EnumDataType(typeof(UserRole), ErrorMessage = "Rol inválido.")]
    public UserRole? Role { get; init; }

    public User ToEntity() => new()
    {
        Name = Name,
        Email = Email,
        Role = Role ?? UserRole.Viewer
    };
}
