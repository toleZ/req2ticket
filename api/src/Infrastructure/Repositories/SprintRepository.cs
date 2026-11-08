using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SprintRepository : BaseRepository<Sprint>, ISprintRepository
{
    public SprintRepository(Req2TicketContext context) : base(context)
    {
    }

    public async Task<Sprint?> GetInProjectAsync(int projectId, int id) =>
        await _dbSet.FirstOrDefaultAsync(s => s.ProjectId == projectId && s.Id == id);

    public async Task<List<SprintSummary>> GetSummariesAsync(int projectId) =>
        await Summaries(projectId, id: null).ToListAsync();

    public async Task<SprintSummary?> GetSummaryAsync(int projectId, int id) =>
        await Summaries(projectId, id).FirstOrDefaultAsync();

    public async Task<Sprint?> GetActiveAsync(int projectId) =>
        await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProjectId == projectId && s.Status == SprintStatus.Active);

    /* Committed points: the points of the sprint's stories and tasks, cancelled ones left out like
       in every other rollup. A task inside a story of the same sprint counts on its own too — it is
       the same sum the team sees on the board. The id filter goes before the Select: EF cannot
       translate a condition on a record built by its constructor. */
    private IQueryable<SprintSummary> Summaries(int projectId, int? id) =>
        _dbSet
            .AsNoTracking()
            .Where(s => s.ProjectId == projectId && (id == null || s.Id == id))
            .OrderBy(s => s.StartDate)
            // Two sprints can start the same day; without a tiebreak the list reshuffles.
            .ThenBy(s => s.Id)
            .Select(s => new SprintSummary(
                s.Id,
                s.Name,
                s.Goal,
                s.StartDate,
                s.EndDate,
                s.Capacity,
                s.Status,
                _context.Tickets.Count(t => t.SprintId == s.Id),
                _context.Tickets.Count(t =>
                    t.SprintId == s.Id && t.Status != TicketStatus.Done && t.Status != TicketStatus.Cancelled),
                _context.Tickets.OfType<UserStory>()
                    .Where(t => t.SprintId == s.Id && t.Status != TicketStatus.Cancelled)
                    .Sum(t => t.Points ?? 0)
                + _context.Tickets.OfType<TicketTask>()
                    .Where(t => t.SprintId == s.Id && t.Status != TicketStatus.Cancelled)
                    .Sum(t => t.Points ?? 0)));
}
