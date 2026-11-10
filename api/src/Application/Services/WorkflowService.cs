using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class WorkflowService
{
    // Statuses a ticket can end in. Every other status needs at least one way out.
    private static readonly TicketStatus[] Terminal = [TicketStatus.Done, TicketStatus.Cancelled];

    private readonly IWorkflowRepository _workflowRepository;
    private readonly IUnitOfWork _unitOfWork;

    public WorkflowService(IWorkflowRepository workflowRepository, IUnitOfWork unitOfWork)
    {
        _workflowRepository = workflowRepository;
        _unitOfWork = unitOfWork;
    }

    // Null means the project has no workflow: tickets move freely.
    public async Task<Workflow?> GetAsync(int projectId) =>
        await _workflowRepository.GetByProjectAsync(projectId);

    // Creates the workflow or replaces it whole: the transitions sent are the complete list.
    public async Task<Workflow> ReplaceAsync(int projectId, List<(TicketStatus From, TicketStatus To)> transitions)
    {
        Validate(transitions);

        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        await _workflowRepository.SaveAsync(
            projectId,
            transitions.Select(t => new WorkflowTransition { FromStatus = t.From, ToStatus = t.To }).ToList(),
            DateTimeOffset.UtcNow);

        await transaction.CommitAsync();

        return (await _workflowRepository.GetByProjectAsync(projectId))!;
    }

    public async Task<bool> DeleteAsync(int projectId) =>
        await _workflowRepository.DeleteByProjectAsync(projectId);

    // Without a workflow every move is allowed, like before workflows existed.
    public static bool IsAllowed(Workflow? workflow, TicketStatus from, TicketStatus to) =>
        workflow is null || workflow.Transitions.Any(t => t.FromStatus == from && t.ToStatus == to);

    private static void Validate(List<(TicketStatus From, TicketStatus To)> transitions)
    {
        if (transitions.Count == 0)
        {
            throw new ArgumentException("A workflow needs at least one transition.");
        }

        if (transitions.Any(t => t.From == t.To))
        {
            throw new ArgumentException("A status can't transition to itself.");
        }

        var duplicate = transitions
            .GroupBy(t => t)
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicate is not null)
        {
            throw new ArgumentException(
                $"Transition from {EnumNames.Of(duplicate.Key.From)} to {EnumNames.Of(duplicate.Key.To)} is listed twice.");
        }

        // A status with no way out would trap every ticket that reaches it.
        foreach (TicketStatus status in Enum.GetValues<TicketStatus>().Except(Terminal))
        {
            if (!transitions.Any(t => t.From == status))
            {
                throw new ArgumentException($"{EnumNames.Of(status)} has no way out.");
            }
        }

        // Every status having a way out is not enough: they could all lead to cancelled. A ticket
        // born in todo has to be able to reach done. Statuses nobody reaches are allowed.
        if (!Reachable(transitions, TicketStatus.Todo).Contains(TicketStatus.Done))
        {
            throw new ArgumentException("Done can't be reached from To do.");
        }
    }

    // Every status a ticket can get to from `start`, walking the transitions breadth first.
    private static HashSet<TicketStatus> Reachable(List<(TicketStatus From, TicketStatus To)> transitions, TicketStatus start)
    {
        var reached = new HashSet<TicketStatus> { start };
        var pending = new Queue<TicketStatus>([start]);

        while (pending.Count > 0)
        {
            TicketStatus current = pending.Dequeue();
            foreach (var (_, to) in transitions.Where(t => t.From == current))
            {
                if (reached.Add(to))
                {
                    pending.Enqueue(to);
                }
            }
        }

        return reached;
    }
}
