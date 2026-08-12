using Domain.Entities;

namespace Domain.Interfaces;

public interface IEpicRepository : IBaseRepository<Epic>
{
    Task<Epic?> GetByIdWithOwnerAsync(int id);

    Task<Epic?> GetByCodeAsync(string code);

    Task<bool> CodeExistsAsync(string code);
}
