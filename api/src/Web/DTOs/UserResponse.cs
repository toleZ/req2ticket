using Domain.Entities;

namespace Web.DTOs;

// No Password. Shared by /api/users and /api/auth/login.
public record UserResponse(int Id, string Name, string Email)
{
    public static UserResponse FromEntity(User user) => new(user.Id, user.Name, user.Email);
}
