using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TicketRepository : BaseRepository<Ticket>, ITicketRepository
{
    public TicketRepository(Req2TicketContext context) : base(context)
    {
    }

    public async Task<Ticket?> GetInProjectAsync(int projectId, int id) =>
        await _dbSet.FirstOrDefaultAsync(t => t.ProjectId == projectId && t.Id == id);

    public async Task<Ticket?> GetDetailAsync(int projectId, int id) =>
        await WithRelations().FirstOrDefaultAsync(t => t.ProjectId == projectId && t.Id == id);

    public async Task<Ticket?> GetByCodeAsync(int projectId, string code) =>
        await WithRelations().FirstOrDefaultAsync(t => t.ProjectId == projectId && t.Code == code);

    public async Task<List<TicketSummary>> GetSummariesAsync(int projectId) =>
        (await SummaryRows(projectId, id: null).ToListAsync()).Select(ToSummary).ToList();

    public async Task<TicketSummary?> GetSummaryAsync(int projectId, int id)
    {
        SummaryRow? row = await SummaryRows(projectId, id).FirstOrDefaultAsync();
        return row is null ? null : ToSummary(row);
    }

    public async Task<List<TicketRef>> GetChildRefsAsync(int parentId) =>
        await _dbSet
            .AsNoTracking()
            .Where(t => t.ParentId == parentId)
            .OrderBy(t => t.Id)
            .Select(t => new TicketRef(t.Id, t.Code, t.Type, t.Title, t.Status))
            .ToListAsync();

    public async Task<List<int>> GetChildIdsAsync(int parentId) =>
        await _dbSet
            .Where(t => t.ParentId == parentId)
            .Select(t => t.Id)
            .ToListAsync();

    public async Task<int> CountOpenChildrenAsync(int parentId) =>
        await _dbSet.CountAsync(t =>
            t.ParentId == parentId && t.Status != TicketStatus.Done && t.Status != TicketStatus.Cancelled);

    public async Task<int> CountOpenInEpicAsync(int epicId) =>
        await _dbSet.CountAsync(t =>
            t.EpicId == epicId && t.Status != TicketStatus.Done && t.Status != TicketStatus.Cancelled);

    public async Task<int> CountInSprintAsync(int sprintId) =>
        await _dbSet.CountAsync(t => t.SprintId == sprintId);

    // Only Tickets columns change, so the UPDATE touches one table even with TPT.
    public async Task<int> MoveOpenTicketsAsync(int sprintId, int? targetSprintId) =>
        await _dbSet
            .Where(t => t.SprintId == sprintId && t.Status != TicketStatus.Done && t.Status != TicketStatus.Cancelled)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(t => t.SprintId, targetSprintId)
                .SetProperty(t => t.UpdatedAt, DateTimeOffset.UtcNow));

    public async Task UnassignAsync(int projectId, int userId) =>
        await _dbSet
            .Where(t => t.ProjectId == projectId && t.AssigneeId == userId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(t => t.AssigneeId, (int?)null)
                .SetProperty(t => t.UpdatedAt, DateTimeOffset.UtcNow));

    public async Task SetEpicAsync(List<int> ticketIds, int? epicId) =>
        await _dbSet
            .Where(t => ticketIds.Contains(t.Id))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(t => t.EpicId, epicId)
                .SetProperty(t => t.UpdatedAt, DateTimeOffset.UtcNow));

    public async Task MoveOpenTasksOfAsync(int storyId, int? sprintId) =>
        await _dbSet
            .Where(t => t.ParentId == storyId && t.Type == TicketType.Task
                && t.Status != TicketStatus.Done && t.Status != TicketStatus.Cancelled)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(t => t.SprintId, sprintId)
                .SetProperty(t => t.UpdatedAt, DateTimeOffset.UtcNow));

    /* One row per ticket, read in a single SELECT. Points and the lists live in the type tables, so
       they are read through the subclass: with TPT, EF turns each `is`/cast into a LEFT JOIN on that
       table. Only the type's main list comes back — acceptance criteria for a story, the checklist
       for a task, the verification steps for a fix; a bug has none — and ToSummary turns it into the
       done/total counts. That last step happens after reading because the lists are stored through a
       value converter EF cannot look inside (see ChecklistJson). The arrays are small, and only the
       counts travel to the client.

       The id filter goes before the Select: EF cannot translate a condition on a record built by
       its constructor. */
    private IQueryable<SummaryRow> SummaryRows(int projectId, int? id) =>
        _dbSet
            .AsNoTracking()
            .Where(t => t.ProjectId == projectId && (id == null || t.Id == id))
            .OrderBy(t => t.Id)
            .Select(t => new SummaryRow(
                t.Id,
                t.Code,
                t.Type,
                t.Title,
                t.Status,
                t.Priority,
                t.EpicId,
                t.AssigneeId,
                t.SprintId,
                t.ParentId,
                t is UserStory ? ((UserStory)t).Points : t is TicketTask ? ((TicketTask)t).Points : null,
                t is UserStory ? ((UserStory)t).AcceptanceCriteria : null,
                t is TicketTask ? ((TicketTask)t).Checklist : null,
                t is Fix ? ((Fix)t).VerificationSteps : null,
                _dbSet.Count(child =>
                    child.ParentId == t.Id
                    && child.Status != TicketStatus.Done
                    && child.Status != TicketStatus.Cancelled),
                t.UpdatedAt));

    private static TicketSummary ToSummary(SummaryRow row)
    {
        List<ChecklistItem>? progressList = row.StoryCriteria ?? row.TaskChecklist ?? row.FixSteps;

        return new TicketSummary(
            row.Id,
            row.Code,
            row.Type,
            row.Title,
            row.Status,
            row.Priority,
            row.EpicId,
            row.AssigneeId,
            row.SprintId,
            row.ParentId,
            row.Points,
            progressList?.Count(item => item.Done),
            progressList?.Count,
            row.OpenChildrenCount,
            row.UpdatedAt);
    }

    private sealed record SummaryRow(
        int Id,
        string Code,
        TicketType Type,
        string Title,
        TicketStatus Status,
        TicketPriority Priority,
        int? EpicId,
        int? AssigneeId,
        int? SprintId,
        int? ParentId,
        int? Points,
        List<ChecklistItem>? StoryCriteria,
        List<ChecklistItem>? TaskChecklist,
        List<ChecklistItem>? FixSteps,
        int OpenChildrenCount,
        DateTimeOffset UpdatedAt);

    // Every detail read returns the same graph, so the Include list lives in one place.
    private IQueryable<Ticket> WithRelations() =>
        _dbSet
            .Include(t => t.Epic)
            .Include(t => t.Assignee)
            .Include(t => t.Reporter)
            .Include(t => t.Sprint)
            .Include(t => t.Parent)
            .AsNoTracking();
}
