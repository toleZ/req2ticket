using Domain.Entities;

namespace Domain.Interfaces;

public interface IStoryRepository : IBaseRepository<Story>
{
    Task<Story?> GetByIdWithRelationsAsync(int id);

    Task<Story?> GetByCodeAsync(string code);

    Task<bool> CodeExistsAsync(string code);
}
