using Domain.Entities;

namespace Domain.Interfaces;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User?> GetByEmailAsync(string email);

    Task<bool> ExistsByEmailAsync(string email);
}
