using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ProjectMemberRepository : IProjectMemberRepository
{
    private readonly Req2TicketContext _context;

    public ProjectMemberRepository(Req2TicketContext context)
    {
        _context = context;
    }

    public async Task<ProjectMember?> GetAsync(int projectId, int userId) =>
        await _context.ProjectMembers.FindAsync(projectId, userId);

    public async Task<bool> IsMemberAsync(int projectId, int userId) =>
        await _context.ProjectMembers.AnyAsync(m => m.ProjectId == projectId && m.UserId == userId);

    public async Task<List<MemberSummary>> GetSummariesAsync(int projectId) =>
        await Summaries(projectId, userId: null).ToListAsync();

    public async Task<MemberSummary?> GetSummaryAsync(int projectId, int userId) =>
        await Summaries(projectId, userId).FirstOrDefaultAsync();

    public async Task<int> CountWithRoleAsync(int projectId, ProjectRole role) =>
        await _context.ProjectMembers.CountAsync(m => m.ProjectId == projectId && m.Role == role);

    public async Task AddAsync(ProjectMember member)
    {
        await _context.ProjectMembers.AddAsync(member);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(ProjectMember member)
    {
        _context.ProjectMembers.Update(member);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(ProjectMember member)
    {
        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
    }

    /* The counts are this project's only: they are what removing the member would unassign.
       Filtering and ordering happen before the Select: EF cannot translate a condition on a record
       built by its constructor. */
    private IQueryable<MemberSummary> Summaries(int projectId, int? userId) =>
        _context.ProjectMembers
            .AsNoTracking()
            .Where(m => m.ProjectId == projectId && (userId == null || m.UserId == userId))
            .OrderBy(m => m.User!.Name)
            .ThenBy(m => m.UserId)
            .Select(m => new MemberSummary(
                m.UserId,
                m.User!.Name,
                m.User.Email,
                m.Role,
                _context.Tickets.Count(t => t.ProjectId == projectId && t.AssigneeId == m.UserId),
                _context.Epics.Count(e => e.ProjectId == projectId && e.OwnerId == m.UserId)));
}
