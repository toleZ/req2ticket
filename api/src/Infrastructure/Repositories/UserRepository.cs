using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(Req2TicketContext context) : base(context)
    {
    }

    public override async Task<List<User>> GetAllAsync() =>
        await _dbSet
            .AsNoTracking()
            .OrderBy(u => u.Id)
            .ToListAsync();

    // Plain == so it uses the index. The caller lowercases the argument; pass a raw address and
    // this silently misses.
    public async Task<User?> GetByEmailAsync(string email) =>
        await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);

    public async Task<bool> ExistsByEmailAsync(string email) =>
        await _dbSet.AnyAsync(u => u.Email == email);

    public async Task<int> CountByRoleAsync(PlatformRole role) =>
        await _dbSet.CountAsync(u => u.PlatformRole == role);
}
