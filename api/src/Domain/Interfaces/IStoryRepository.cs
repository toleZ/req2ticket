using Domain.Entities;

namespace Domain.Interfaces;

public interface IStoryRepository : IBaseRepository<Story>
{
    Task<Story?> GetByIdWithRelationsAsync(int id);

    Task<List<Story>> GetByEpicIdAsync(int epicId);

    // A null sprintId means the backlog: the stories that are not planned into any sprint.
    Task<List<Story>> GetBySprintIdAsync(int? sprintId);

    Task<Story?> GetByCodeAsync(string code);

    Task<bool> CodeExistsAsync(string code);
}
