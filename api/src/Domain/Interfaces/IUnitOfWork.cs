namespace Domain.Interfaces;

/* For the operations that touch several rows and must not stop halfway: completing a sprint,
   taking a code number and inserting the ticket, removing a member, deleting a ticket with its
   descendants. Every repository shares the same DbContext per request, so whatever they save
   between Begin and Commit lands — or rolls back — together.

       await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();
       ...
       await transaction.CommitAsync();

   Disposing without committing rolls back. Nested calls are fine: if a transaction is already
   open (the seeder, or a service calling another), the inner scope does nothing and the outer
   one decides. */
public interface IUnitOfWork
{
    Task<ITransactionScope> BeginTransactionAsync();
}

public interface ITransactionScope : IAsyncDisposable
{
    Task CommitAsync();
}
