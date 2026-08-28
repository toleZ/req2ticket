using Domain.Entities;

namespace Domain.Interfaces;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User?> GetByEmailAsync(string email);

    Task<bool> ExistsByEmailAsync(string email);

    // Exists for one rule only: never leave the system without a superAdmin.
    Task<int> CountByRoleAsync(UserRole role);
}
