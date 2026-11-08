using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;

namespace Application.Services;

/* A sprint's life is planned → active → completed, one step at a time and each through its own
   action (ENT-5). The PUT edits the data and never the status: that way the rules of starting and
   completing live in StartAsync and CompleteAsync and nowhere else. */
public class SprintService
{
    private readonly ISprintRepository _sprintRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SprintService(ISprintRepository sprintRepository, ITicketRepository ticketRepository, IUnitOfWork unitOfWork)
    {
        _sprintRepository = sprintRepository;
        _ticketRepository = ticketRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SprintSummary>> GetSummariesAsync(int projectId) =>
        await _sprintRepository.GetSummariesAsync(projectId);

    public async Task<SprintSummary?> GetSummaryAsync(int projectId, int id) =>
        await _sprintRepository.GetSummaryAsync(projectId, id);

    // Every sprint is born planned.
    public async Task<Sprint> CreateAsync(int projectId, Sprint sprint)
    {
        EnsureDatesAreValid(sprint);

        sprint.ProjectId = projectId;
        sprint.Status = SprintStatus.Planned;

        await _sprintRepository.AddAsync(sprint);
        return sprint;
    }

    public async Task<bool> UpdateAsync(int projectId, int id, Sprint changes)
    {
        Sprint? sprint = await _sprintRepository.GetInProjectAsync(projectId, id);
        if (sprint is null)
        {
            return false;
        }

        if (sprint.Status == SprintStatus.Completed)
        {
            throw new ArgumentException("Completed sprints can't be edited.");
        }

        EnsureDatesAreValid(changes);

        sprint.Name = changes.Name;
        sprint.Goal = changes.Goal;
        sprint.StartDate = changes.StartDate;
        sprint.EndDate = changes.EndDate;
        sprint.Capacity = changes.Capacity;

        await _sprintRepository.UpdateAsync(sprint);
        return true;
    }

    /* The check below is for the message. The real guarantee of one active sprint is the partial
       unique index: two "Start" clicks at once both pass this check, and the index stops the second. */
    public async Task<bool> StartAsync(int projectId, int id)
    {
        Sprint? sprint = await _sprintRepository.GetInProjectAsync(projectId, id);
        if (sprint is null)
        {
            return false;
        }

        if (sprint.Status != SprintStatus.Planned)
        {
            throw new ArgumentException("Only a planned sprint can be started.");
        }

        if (await _sprintRepository.GetActiveAsync(projectId) is not null)
        {
            throw new ArgumentException("Another sprint is already active.");
        }

        sprint.Status = SprintStatus.Active;
        await _sprintRepository.UpdateAsync(sprint);
        return true;
    }

    /* Completing can leave work open: the open tickets move to the destination (a planned sprint
       of the project, or the backlog with null) keeping their status, while done and cancelled ones
       stay as the sprint's history. One transaction: a sprint is never completed with half its
       tickets moved. Returns how many moved, or null when the sprint does not exist. */
    public async Task<int?> CompleteAsync(int projectId, int id, int? moveOpenTicketsTo)
    {
        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        Sprint? sprint = await _sprintRepository.GetInProjectAsync(projectId, id);
        if (sprint is null)
        {
            return null;
        }

        if (sprint.Status != SprintStatus.Active)
        {
            throw new ArgumentException("Only the active sprint can be completed.");
        }

        if (moveOpenTicketsTo is not null)
        {
            Sprint? destination = await _sprintRepository.GetInProjectAsync(projectId, moveOpenTicketsTo.Value);
            if (destination is null || destination.Id == id || destination.Status != SprintStatus.Planned)
            {
                throw new ArgumentException("Open tickets can only move to a planned sprint of this project.");
            }
        }

        int moved = await _ticketRepository.MoveOpenTicketsAsync(id, moveOpenTicketsTo);

        sprint.Status = SprintStatus.Completed;
        await _sprintRepository.UpdateAsync(sprint);

        await transaction.CommitAsync();
        return moved;
    }

    // Active and completed sprints are history. Deleting a planned one sends its tickets back to
    // the backlog (the database sets SprintId to null).
    public async Task<bool> DeleteAsync(int projectId, int id)
    {
        Sprint? sprint = await _sprintRepository.GetInProjectAsync(projectId, id);
        if (sprint is null)
        {
            return false;
        }

        if (sprint.Status != SprintStatus.Planned)
        {
            throw new ArgumentException("Only planned sprints can be deleted.");
        }

        await _sprintRepository.DeleteAsync(id);
        return true;
    }

    private static void EnsureDatesAreValid(Sprint sprint)
    {
        if (sprint.EndDate < sprint.StartDate)
        {
            throw new ArgumentException("End date can't be before start date.");
        }
    }
}
