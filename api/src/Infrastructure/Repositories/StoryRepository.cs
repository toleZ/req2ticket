using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class StoryRepository : BaseRepository<Story>, IStoryRepository
{
    public StoryRepository(Req2TicketContext context) : base(context)
    {
    }

    public override async Task<List<Story>> GetAllAsync() =>
        await _dbSet
            .Include(s => s.Epic)
            .Include(s => s.Assignee)
            .Include(s => s.Sprint)
            .AsNoTracking()
            .OrderBy(s => s.Id)
            .ToListAsync();

    public async Task<Story?> GetByCodeAsync(string code) =>
        await _dbSet
            .Include(s => s.Epic)
            .Include(s => s.Assignee)
            .Include(s => s.Sprint)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code == code);

    public async Task<bool> CodeExistsAsync(string code) =>
        await _dbSet.AnyAsync(s => s.Code == code);

    public async Task<Story?> GetByIdWithRelationsAsync(int id) =>
        await _dbSet
            .Include(s => s.Epic)
            .Include(s => s.Assignee)
            .Include(s => s.Sprint)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<List<Story>> GetByEpicIdAsync(int epicId) =>
        await _dbSet
            .Include(s => s.Epic)
            .Include(s => s.Assignee)
            .Include(s => s.Sprint)
            .AsNoTracking()
            .Where(s => s.EpicId == epicId)
            .OrderBy(s => s.Id)
            .ToListAsync();

    public async Task<List<Story>> GetBySprintIdAsync(int? sprintId) =>
        await _dbSet
            .Include(s => s.Epic)
            .Include(s => s.Assignee)
            .Include(s => s.Sprint)
            .AsNoTracking()
            .Where(s => s.SprintId == sprintId)
            .OrderBy(s => s.Id)
            .ToListAsync();
}
