using Domain.Entities;

namespace Domain.Interfaces;

public interface ITicketRepository : IBaseRepository<Ticket>
{
    Task<Ticket?> GetByIdWithRelationsAsync(int id);

    Task<List<Ticket>> GetByEpicIdAsync(int epicId);

    // A null sprintId means the backlog: the tickets that are not planned into any sprint.
    Task<List<Ticket>> GetBySprintIdAsync(int? sprintId);

    // The tickets a ticket divides into. Used on delete, which takes the children with it.
    Task<List<Ticket>> GetByParentIdAsync(int parentId);

    Task<Ticket?> GetByCodeAsync(string code);

    Task<bool> CodeExistsAsync(string code);
}
