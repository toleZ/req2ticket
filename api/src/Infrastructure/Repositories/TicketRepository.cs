using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TicketRepository : BaseRepository<Ticket>, ITicketRepository
{
    public TicketRepository(Req2TicketContext context) : base(context)
    {
    }

    public override async Task<List<Ticket>> GetAllAsync() =>
        await WithRelations()
            .OrderBy(t => t.Id)
            .ToListAsync();

    public async Task<Ticket?> GetByCodeAsync(string code) =>
        await WithRelations()
            .FirstOrDefaultAsync(t => t.Code == code);

    public async Task<bool> CodeExistsAsync(string code) =>
        await _dbSet.AnyAsync(t => t.Code == code);

    public async Task<Ticket?> GetByIdWithRelationsAsync(int id) =>
        await WithRelations()
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<List<Ticket>> GetByEpicIdAsync(int epicId) =>
        await WithRelations()
            .Where(t => t.EpicId == epicId)
            .OrderBy(t => t.Id)
            .ToListAsync();

    public async Task<List<Ticket>> GetBySprintIdAsync(int? sprintId) =>
        await WithRelations()
            .Where(t => t.SprintId == sprintId)
            .OrderBy(t => t.Id)
            .ToListAsync();

    // Parent is deliberately not included: the caller already holds it, and including a
    // self-referencing navigation on a list query pulls a second copy of every row.
    public async Task<List<Ticket>> GetByParentIdAsync(int parentId) =>
        await WithRelations()
            .Where(t => t.ParentId == parentId)
            .OrderBy(t => t.Id)
            .ToListAsync();

    // Every read returns the same graph, so the Include list lives in one place: adding a
    // navigation property here cannot be forgotten in five of the six queries.
    private IQueryable<Ticket> WithRelations() =>
        _dbSet
            .Include(t => t.Epic)
            .Include(t => t.Assignee)
            .Include(t => t.Reporter)
            .Include(t => t.Sprint)
            .AsNoTracking();
}
