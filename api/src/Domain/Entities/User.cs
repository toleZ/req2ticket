using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(120)]
    public string Email { get; set; } = string.Empty;

    // Plain text on purpose: the login is simulated, there is no hashing or JWT yet.
    // [JsonIgnore] is a safety net, NOT the mechanism: the real guarantee is that no
    // endpoint ever returns this entity, only UserResponse.
    [Required]
    [StringLength(100)]
    [JsonIgnore]
    public string Password { get; set; } = string.Empty;
}
