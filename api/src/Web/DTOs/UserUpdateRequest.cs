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
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 80 characters.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not a valid address.")]
    [StringLength(120, ErrorMessage = "Email cannot exceed 120 characters.")]
    public string Email { get; init; } = string.Empty;

    // No [Required]: absent means "leave it as it is".
    [StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 72 characters.")]
    public string? Password { get; init; }

    // See UserCreateRequest for why the converter is repeated on the property.
    [Required(ErrorMessage = "Role is required.")]
    [JsonConverter(typeof(StringOnlyEnumConverter<UserRole>))]
    [EnumDataType(typeof(UserRole), ErrorMessage = "Invalid role.")]
    public UserRole? Role { get; init; }

    public User ToEntity() => new()
    {
        Name = Name,
        Email = Email,
        Role = Role ?? UserRole.Viewer
    };
}
