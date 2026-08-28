using Domain.Common;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Web.DTOs;

// Creating a user on someone's behalf, not a public sign-up. The difference from RegisterRequest
// is Role: here it is asked for, there it is ignored and the account always comes out a viewer.
// Which roles the caller may hand out is UserService's call — DataAnnotations cannot express a
// rule that depends on who is logged in.
public record UserCreateRequest
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

    /* The [JsonConverter] on the enum type is not consulted for a nullable property, so the
       default converter takes over and accepts integers: "role": 6 would quietly bind to
       superAdmin. Repeating it here is what turns that off.

       Nullable and [Required] together on purpose: without an explicit role, a non-nullable
       UserRole would bind to 0 (viewer) in silence. Better to demand it than to guess it. */
    [Required(ErrorMessage = "El rol es obligatorio.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<UserRole>))]
    [EnumDataType(typeof(UserRole), ErrorMessage = "Rol inválido.")]
    public UserRole? Role { get; init; }

    // Manual mapping: AutoMapper is not installed. PasswordHash is left empty — hashing is the
    // service's job, since it is the only one that knows PasswordHasher.
    public User ToEntity() => new()
    {
        Name = Name,
        Email = Email,
        Role = Role ?? UserRole.Viewer
    };
}
