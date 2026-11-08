using Domain.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure;

// See IUnitOfWork for how it is used. One transaction per request at most: if one is already
// open, the inner scope is a no-op and the outermost caller commits or rolls back.
public class UnitOfWork : IUnitOfWork
{
    private readonly Req2TicketContext _context;

    public UnitOfWork(Req2TicketContext context)
    {
        _context = context;
    }

    public async Task<ITransactionScope> BeginTransactionAsync()
    {
        if (_context.Database.CurrentTransaction is not null)
        {
            return NestedScope.Instance;
        }

        IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync();
        return new Scope(_context, transaction);
    }

    private sealed class Scope : ITransactionScope
    {
        private readonly Req2TicketContext _context;
        private readonly IDbContextTransaction _transaction;
        private bool _committed;

        public Scope(Req2TicketContext context, IDbContextTransaction transaction)
        {
            _context = context;
            _transaction = transaction;
        }

        public async Task CommitAsync()
        {
            await _transaction.CommitAsync();
            _committed = true;
        }

        public async ValueTask DisposeAsync()
        {
            if (!_committed)
            {
                await _transaction.RollbackAsync();

                // The tracked entities still hold what the rolled-back statements wrote. Forget
                // them, so nothing later in the request saves them again by accident.
                _context.ChangeTracker.Clear();
            }

            await _transaction.DisposeAsync();
        }
    }

    private sealed class NestedScope : ITransactionScope
    {
        public static readonly NestedScope Instance = new();

        public Task CommitAsync() => Task.CompletedTask;

        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }
}
