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

    // AsNoTracking because the login only reads. Plain == so it uses the index — a ToLower()
    // here would translate to lower("Email") and skip it. The caller lowercases the argument;
    // pass a raw address and this silently misses.
    public async Task<User?> GetByEmailAsync(string email) =>
        await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);

    // Same rule: lowercase in, lowercase stored, so registering "Juan@..." when "juan@..."
    // exists is caught here and not by the unique index.
    public async Task<bool> ExistsByEmailAsync(string email) =>
        await _dbSet.AnyAsync(u => u.Email == email);

    // CountAsync and not GetAll().Count(), so the rows never travel.
    public async Task<int> CountByRoleAsync(UserRole role) =>
        await _dbSet.CountAsync(u => u.Role == role);
}
