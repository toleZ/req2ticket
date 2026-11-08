using Domain.Entities;
using Domain.ReadModels;

namespace Domain.Interfaces;

// Every lookup takes the project: an id from another project is "not found", never a leak.
public interface ITicketRepository : IBaseRepository<Ticket>
{
    // Tracked, for updates. Comes back as its real subclass (Bug, Fix…).
    Task<Ticket?> GetInProjectAsync(int projectId, int id);

    // With epic, people, sprint and parent, read-only.
    Task<Ticket?> GetDetailAsync(int projectId, int id);

    Task<Ticket?> GetByCodeAsync(int projectId, string code);

    Task<List<TicketSummary>> GetSummariesAsync(int projectId);

    Task<TicketSummary?> GetSummaryAsync(int projectId, int id);

    Task<List<TicketRef>> GetChildRefsAsync(int parentId);

    Task<List<int>> GetChildIdsAsync(int parentId);

    Task<int> CountOpenChildrenAsync(int parentId);

    Task<int> CountOpenInEpicAsync(int epicId);

    // Moves a sprint's open tickets to another sprint (or the backlog with null). Done and
    // cancelled ones stay as history. Returns how many moved.
    Task<int> MoveOpenTicketsAsync(int sprintId, int? targetSprintId);

    // Leaves the user's tickets in this project without an assignee (removing a member).
    Task UnassignAsync(int projectId, int userId);
}
