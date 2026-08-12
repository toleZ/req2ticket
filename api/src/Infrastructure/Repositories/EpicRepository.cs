using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class EpicRepository : BaseRepository<Epic>, IEpicRepository
{
    public EpicRepository(Req2TicketContext context) : base(context)
    {
    }

    public override async Task<List<Epic>> GetAllAsync() =>
        await _dbSet
            .Include(e => e.Owner)
            .AsNoTracking()
            .OrderBy(e => e.Id)
            .ToListAsync();

    public async Task<Epic?> GetByCodeAsync(string code) =>
        await _dbSet
            .Include(e => e.Owner)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Code == code);

    public async Task<bool> CodeExistsAsync(string code) =>
        await _dbSet.AnyAsync(e => e.Code == code);

    public async Task<Epic?> GetByIdWithOwnerAsync(int id) =>
        await _dbSet
            .Include(e => e.Owner)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);
}
