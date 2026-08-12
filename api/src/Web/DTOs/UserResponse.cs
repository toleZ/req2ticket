using Domain.Entities;

namespace Web.DTOs;

// No PasswordHash. Shared by /api/users and /api/auth/login.
public record UserResponse(int Id, string Name, string Email, UserRole Role)
{
    public static UserResponse FromEntity(User user) => new(user.Id, user.Name, user.Email, user.Role);
}
