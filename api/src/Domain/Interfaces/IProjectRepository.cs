using Domain.Common;
using Domain.Entities;
using Domain.ReadModels;

namespace Domain.Interfaces;

public interface IProjectRepository : IBaseRepository<Project>
{
    Task<bool> KeyExistsAsync(string key);

    Task<bool> AnyAsync();

    // The projects a user may open: theirs, or every one for a SuperAdmin.
    Task<List<ProjectListItem>> GetForUserAsync(int userId, bool isSuperAdmin, bool includeArchived);

    // Null when the project does not exist, or the user is neither a member nor a SuperAdmin.
    Task<ProjectAccess?> GetAccessAsync(int projectId, int userId);

    /* Takes the next number of a sequence and advances it, in one atomic statement
       (UPDATE … RETURNING). Call it inside the transaction that inserts the row: two people
       creating a bug at once then wait for each other instead of getting the same number, and a
       failed insert rolls the counter back with it. */
    Task<int> TakeNextNumberAsync(int projectId, NumberedKind kind);
}
