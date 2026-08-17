using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SprintRepository : BaseRepository<Sprint>, ISprintRepository
{
    public SprintRepository(Req2TicketContext context) : base(context)
    {
    }

    public override async Task<List<Sprint>> GetAllAsync() =>
        await _dbSet
            .AsNoTracking()
            .OrderBy(s => s.StartDate)
            .ToListAsync();

    public async Task<bool> HasActiveSprintAsync(int? excludeId) =>
        await _dbSet.AnyAsync(s => s.Status == SprintStatus.Active && s.Id != (excludeId ?? 0));
}
