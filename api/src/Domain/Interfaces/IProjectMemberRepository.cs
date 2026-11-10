using Domain.Entities;
using Domain.ReadModels;

namespace Domain.Interfaces;

// Not an IBaseRepository: the key is (ProjectId, UserId), not an int Id.
public interface IProjectMemberRepository
{
    // Tracked, so the caller can change the role and save it.
    Task<ProjectMember?> GetAsync(int projectId, int userId);

    Task<bool> IsMemberAsync(int projectId, int userId);

    Task<List<MemberSummary>> GetSummariesAsync(int projectId);

    Task<MemberSummary?> GetSummaryAsync(int projectId, int userId);

    Task<int> CountWithRoleAsync(int projectId, ProjectRole role);

    // The keys of the projects where this user is the only Admin: deleting them would leave those
    // projects with nobody to manage them.
    Task<List<string>> GetKeysWhereOnlyAdminAsync(int userId);

    Task AddAsync(ProjectMember member);

    Task UpdateAsync(ProjectMember member);

    Task RemoveAsync(ProjectMember member);
}
