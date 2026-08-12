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

    // AsNoTracking because the login only reads. The Email column uses the NOCASE
    // collation, so this comparison is case-insensitive without a ToLower() that would
    // skip the index.
    public async Task<User?> GetByEmailAsync(string email) =>
        await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);
}
