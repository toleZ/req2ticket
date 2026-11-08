using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class EpicRepository : BaseRepository<Epic>, IEpicRepository
{
    public EpicRepository(Req2TicketContext context) : base(context)
    {
    }

    public async Task<Epic?> GetInProjectAsync(int projectId, int id) =>
        await _dbSet.FirstOrDefaultAsync(e => e.ProjectId == projectId && e.Id == id);

    public async Task<Epic?> GetDetailAsync(int projectId, int id) =>
        await _dbSet
            .Include(e => e.Owner)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.ProjectId == projectId && e.Id == id);

    public async Task<Epic?> GetByCodeAsync(int projectId, string code) =>
        await _dbSet
            .Include(e => e.Owner)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.ProjectId == projectId && e.Code == code);

    public async Task<List<EpicSummary>> GetSummariesAsync(int projectId) =>
        await Summaries(projectId, id: null).ToListAsync();

    public async Task<EpicSummary?> GetSummaryAsync(int projectId, int id) =>
        await Summaries(projectId, id).FirstOrDefaultAsync();

    public async Task ClearOwnerAsync(int projectId, int userId) =>
        await _dbSet
            .Where(e => e.ProjectId == projectId && e.OwnerId == userId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(e => e.OwnerId, (int?)null));

    /* The counts are subqueries of the same SELECT: one round trip, no ticket rows travel. The id
       filter goes before the Select: EF cannot translate a condition on a record built by its
       constructor. */
    private IQueryable<EpicSummary> Summaries(int projectId, int? id) =>
        _dbSet
            .AsNoTracking()
            .Where(e => e.ProjectId == projectId && (id == null || e.Id == id))
            .OrderBy(e => e.Number)
            .Select(e => new EpicSummary(
                e.Id,
                e.Code,
                e.Name,
                e.AccentColor,
                e.Priority,
                e.Status,
                e.OwnerId,
                _context.Tickets.Count(t => t.EpicId == e.Id),
                _context.Tickets.Count(t =>
                    t.EpicId == e.Id && t.Status != TicketStatus.Done && t.Status != TicketStatus.Cancelled),
                _context.Tickets.Count(t => t.EpicId == e.Id && t.Status == TicketStatus.Done)));
}
