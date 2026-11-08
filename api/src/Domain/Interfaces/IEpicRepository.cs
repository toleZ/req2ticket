using Domain.Entities;
using Domain.ReadModels;

namespace Domain.Interfaces;

// Every lookup takes the project: an id from another project is "not found", never a leak.
public interface IEpicRepository : IBaseRepository<Epic>
{
    // Tracked, for updates.
    Task<Epic?> GetInProjectAsync(int projectId, int id);

    // With the owner, read-only.
    Task<Epic?> GetDetailAsync(int projectId, int id);

    Task<Epic?> GetByCodeAsync(int projectId, string code);

    Task<List<EpicSummary>> GetSummariesAsync(int projectId);

    Task<EpicSummary?> GetSummaryAsync(int projectId, int id);

    // Leaves the user's epics in this project without an owner (removing a member).
    Task ClearOwnerAsync(int projectId, int userId);
}
