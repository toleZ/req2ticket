using Domain.Entities;
using Domain.ReadModels;

namespace Domain.Interfaces;

public interface ISprintRepository : IBaseRepository<Sprint>
{
    // Tracked, for updates.
    Task<Sprint?> GetInProjectAsync(int projectId, int id);

    Task<List<SprintSummary>> GetSummariesAsync(int projectId);

    Task<SprintSummary?> GetSummaryAsync(int projectId, int id);

    Task<Sprint?> GetActiveAsync(int projectId);
}
