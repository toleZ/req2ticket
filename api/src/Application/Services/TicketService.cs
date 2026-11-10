using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;

namespace Application.Services;

// What the detail of a ticket shows besides the ticket itself.
public sealed record TicketDetailView(Ticket Ticket, List<TicketRef> Children, int OpenChildrenCount, int DescendantCount);

/* The rules of a ticket's family, said once here and enforced by every method below:
     - a child has its parent's epic (the epic itself is optional);
     - an open task is in its story's sprint;
     - a closed parent never has open children;
     - a ticket of a completed sprint keeps its status and its sprint (it is that sprint's history);
     - nothing in a closed epic changes until the epic is reopened. */
public class TicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IEpicRepository _epicRepository;
    private readonly ISprintRepository _sprintRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IProjectMemberRepository _memberRepository;
    private readonly IWorkflowRepository _workflowRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TicketService(
        ITicketRepository ticketRepository,
        IEpicRepository epicRepository,
        ISprintRepository sprintRepository,
        IProjectRepository projectRepository,
        IProjectMemberRepository memberRepository,
        IWorkflowRepository workflowRepository,
        IUnitOfWork unitOfWork)
    {
        _ticketRepository = ticketRepository;
        _epicRepository = epicRepository;
        _sprintRepository = sprintRepository;
        _projectRepository = projectRepository;
        _memberRepository = memberRepository;
        _workflowRepository = workflowRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TicketSummary>> GetSummariesAsync(int projectId) =>
        await _ticketRepository.GetSummariesAsync(projectId);

    public async Task<TicketSummary?> GetSummaryAsync(int projectId, int id) =>
        await _ticketRepository.GetSummaryAsync(projectId, id);

    public async Task<TicketDetailView?> GetDetailAsync(int projectId, int id) =>
        await BuildDetailAsync(await _ticketRepository.GetDetailAsync(projectId, id));

    public async Task<TicketDetailView?> GetByCodeAsync(int projectId, string code) =>
        await BuildDetailAsync(await _ticketRepository.GetByCodeAsync(projectId, code.Trim().ToUpperInvariant()));

    /* Creating: the project comes from the route and the reporter from the token, never from the
       body. Every ticket is born in "todo" — status only changes afterwards, through
       ChangeStatusAsync. The number is taken and the ticket inserted in one transaction. */
    public async Task<Ticket> CreateAsync(int projectId, int reporterId, Ticket ticket)
    {
        ticket.ProjectId = projectId;
        ticket.ReporterId = reporterId;
        ticket.Status = TicketStatus.Todo;

        await ResolveReferencesAsync(projectId, ticket, existing: null);

        Project project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new ArgumentException("Project not found.");

        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        NumberedKind kind = WorkItemCode.KindOf(ticket.Type);
        ticket.Number = await _projectRepository.TakeNextNumberAsync(projectId, kind);
        ticket.Code = WorkItemCode.Format(project.Key, kind, ticket.Number);
        ticket.CreatedAt = DateTimeOffset.UtcNow;
        ticket.UpdatedAt = ticket.CreatedAt;

        await _ticketRepository.AddAsync(ticket);
        await transaction.CommitAsync();
        return ticket;
    }

    /* Full replacement of everything the ticket owns except its identity (code, number, type,
       project), its reporter and its status. `changes` is a ticket of the type the client sent; if
       that is not this ticket's type, the request is refused rather than silently converted.

       What follows the ticket: if its epic changes, its whole subtree goes to the new epic; if a
       story changes sprint, its open tasks go with it. One transaction for all of it. */
    public async Task<bool> UpdateAsync(int projectId, int id, Ticket changes)
    {
        Ticket? ticket = await _ticketRepository.GetInProjectAsync(projectId, id);
        if (ticket is null)
        {
            return false;
        }

        if (changes.Type != ticket.Type)
        {
            throw new ArgumentException("Ticket type cannot be changed.");
        }

        await EnsureEpicIsOpenAsync(ticket.EpicId);
        await ResolveReferencesAsync(projectId, changes, existing: ticket);

        bool epicChanged = ticket.EpicId != changes.EpicId;
        bool sprintChanged = ticket.SprintId != changes.SprintId;

        ticket.Title = changes.Title;
        ticket.Description = changes.Description;
        ticket.EpicId = changes.EpicId;
        ticket.Priority = changes.Priority;
        ticket.AssigneeId = changes.AssigneeId;
        ticket.SprintId = changes.SprintId;
        ticket.ParentId = changes.ParentId;
        CopyTypeFields(changes, ticket);
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        await _ticketRepository.UpdateAsync(ticket);
        await FollowParentAsync(ticket, epicChanged, sprintChanged);

        await transaction.CommitAsync();
        return true;
    }

    /* The only way a ticket's status changes after it is created — the detail's selector and the
       board both come here, so every rule is checked once (ENT-3), in this order:
         1. the same status is a no-op;
         2. a ticket of a completed sprint keeps its status;
         3. the move has to be in the project's workflow, if it has one;
         4. closing (done or cancelled) needs every child closed;
         5. reopening needs the parent open;
         6. the epic has to be open. */
    public async Task<bool> ChangeStatusAsync(int projectId, int id, TicketStatus status)
    {
        Ticket? ticket = await _ticketRepository.GetInProjectAsync(projectId, id);
        if (ticket is null)
        {
            return false;
        }

        if (ticket.Status == status)
        {
            return true;
        }

        if (await IsInCompletedSprintAsync(projectId, ticket.SprintId))
        {
            throw new ArgumentException("The ticket belongs to a completed sprint.");
        }

        Workflow? workflow = await _workflowRepository.GetByProjectAsync(projectId);
        if (!WorkflowService.IsAllowed(workflow, ticket.Status, status))
        {
            throw new ArgumentException(
                $"Transition from {EnumNames.Of(ticket.Status)} to {EnumNames.Of(status)} is not allowed.");
        }

        bool closing = TicketRules.IsOpen(ticket.Status) && !TicketRules.IsOpen(status);
        if (closing && await _ticketRepository.CountOpenChildrenAsync(id) > 0)
        {
            throw new ArgumentException("Close its child tickets first.");
        }

        bool reopening = !TicketRules.IsOpen(ticket.Status) && TicketRules.IsOpen(status);
        if (reopening && ticket.ParentId is not null)
        {
            Ticket? parent = await _ticketRepository.GetInProjectAsync(projectId, ticket.ParentId.Value);
            if (parent is not null && !TicketRules.IsOpen(parent.Status))
            {
                throw new ArgumentException($"Reopen {parent.Code} first.");
            }
        }

        await EnsureEpicIsOpenAsync(ticket.EpicId);

        ticket.Status = status;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);
        return true;
    }

    /* A ticket takes its whole subtree with it: a story's tasks and bugs, and those bugs' fixes.
       Deleted from the leaves up, because the parent reference refuses to point at a row that is
       gone. One transaction, so a failure never leaves half a tree. */
    public async Task<bool> DeleteAsync(int projectId, int id)
    {
        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        Ticket? ticket = await _ticketRepository.GetInProjectAsync(projectId, id);
        if (ticket is null)
        {
            return false;
        }

        await EnsureEpicIsOpenAsync(ticket.EpicId);

        List<int> subtree = await CollectSubtreeAsync(id);

        // CollectSubtreeAsync lists parents before their children, so reversing it deletes leaves
        // first and the ticket itself last.
        subtree.Reverse();
        foreach (int ticketId in subtree)
        {
            await _ticketRepository.DeleteAsync(ticketId);
        }

        await transaction.CommitAsync();
        return true;
    }

    private async Task<TicketDetailView?> BuildDetailAsync(Ticket? ticket)
    {
        if (ticket is null)
        {
            return null;
        }

        List<TicketRef> children = await _ticketRepository.GetChildRefsAsync(ticket.Id);
        int openChildren = children.Count(c => TicketRules.IsOpen(c.Status));

        // Everything a delete would take with it, so the confirmation can say how many.
        int descendants = (await CollectSubtreeAsync(ticket.Id)).Count - 1;

        return new TicketDetailView(ticket, children, openChildren, descendants);
    }

    // The ticket and every descendant, breadth first: parents always before their children. The
    // depth is at most three (story → bug → fix), so this is a handful of small queries.
    private async Task<List<int>> CollectSubtreeAsync(int rootId)
    {
        var ids = new List<int> { rootId };

        for (int index = 0; index < ids.Count; index++)
        {
            ids.AddRange(await _ticketRepository.GetChildIdsAsync(ids[index]));
        }

        return ids;
    }

    // After the ticket itself is saved: its descendants take its new epic, and a story's open tasks
    // its new sprint. Runs inside the caller's transaction.
    private async Task FollowParentAsync(Ticket ticket, bool epicChanged, bool sprintChanged)
    {
        if (epicChanged)
        {
            List<int> descendants = (await CollectSubtreeAsync(ticket.Id)).Skip(1).ToList();
            if (descendants.Count > 0)
            {
                await _ticketRepository.SetEpicAsync(descendants, ticket.EpicId);
            }
        }

        if (sprintChanged && ticket.Type == TicketType.UserStory)
        {
            await _ticketRepository.MoveOpenTasksOfAsync(ticket.Id, ticket.SprintId);
        }
    }

    /* Everything a ticket points at has to be in the same project, and a few more rules. The
       parent goes first because it decides two of the others:
         - a child takes its parent's epic, whatever the client sent;
         - a task with a story takes the story's sprint (the PUT always sends the sprint, so here
           it is overwritten rather than refused);
         - the epic, if any, has to be open when the ticket moves into it;
         - the assignee has to be a member;
         - the sprint has to be this project's and not completed, and a ticket of a completed
           sprint cannot leave it.
       `existing` is the ticket being updated, null when creating. */
    private async Task ResolveReferencesAsync(int projectId, Ticket ticket, Ticket? existing)
    {
        Ticket? parent = await EnsureParentIsValidAsync(projectId, ticket, existing);
        if (parent is not null)
        {
            ticket.EpicId = parent.EpicId;

            // A new task, or one moving to another story, joins the story's sprint. Otherwise it
            // stays where it is: its story moves it (FollowParentAsync), the form does not.
            if (ticket.Type == TicketType.Task)
            {
                ticket.SprintId = existing is null || existing.ParentId != parent.Id
                    ? parent.SprintId
                    : existing.SprintId;
            }
        }

        if (ticket.EpicId is not null)
        {
            Epic? epic = await _epicRepository.GetInProjectAsync(projectId, ticket.EpicId.Value);
            if (epic is null)
            {
                throw new ArgumentException("The epic doesn't exist in this project.");
            }

            bool epicChanged = existing is null || existing.EpicId != ticket.EpicId;
            if (epicChanged && epic.Status == EpicStatus.Closed)
            {
                throw new ArgumentException("The epic is closed. Reopen it to add tickets.");
            }
        }

        if (ticket.AssigneeId is not null && !await _memberRepository.IsMemberAsync(projectId, ticket.AssigneeId.Value))
        {
            throw new ArgumentException("The assignee has to be a member of the project.");
        }

        await EnsureSprintChangeIsAllowedAsync(projectId, existing?.SprintId, ticket.SprintId);
    }

    /* Which parent a ticket may hang from, by type:
         userStory -> nothing (an epic, if any, is EpicId)
         task      -> a user story, or nothing
         bug       -> a user story, or nothing
         fix       -> a bug, always
       Any legal chain ends at a story, so there are no cycles and no depth limit to enforce. */
    private static TicketType[] AllowedParentTypes(TicketType childType) => childType switch
    {
        TicketType.Task => [TicketType.UserStory],
        TicketType.Bug => [TicketType.UserStory],
        TicketType.Fix => [TicketType.Bug],
        _ => []
    };

    // Returns the parent, or null when the ticket has none. A closed parent can keep the children
    // it has, but cannot receive new ones: that is only checked when the parent changes.
    private async Task<Ticket?> EnsureParentIsValidAsync(int projectId, Ticket ticket, Ticket? existing)
    {
        if (ticket.ParentId is null)
        {
            if (ticket.Type == TicketType.Fix)
            {
                throw new ArgumentException("A fix must hang from a bug.");
            }

            return null;
        }

        if (existing is not null && ticket.ParentId == existing.Id)
        {
            throw new ArgumentException("A ticket can't be its own parent.");
        }

        Ticket? parent = await _ticketRepository.GetInProjectAsync(projectId, ticket.ParentId.Value);
        if (parent is null)
        {
            throw new ArgumentException("The parent ticket doesn't exist in this project.");
        }

        TicketType[] allowed = AllowedParentTypes(ticket.Type);
        if (!allowed.Contains(parent.Type))
        {
            throw new ArgumentException(allowed.Length == 0
                ? "A user story can't have a parent ticket."
                : $"A {EnumNames.Of(ticket.Type)} can only hang from a {EnumNames.Of(allowed[0])}.");
        }

        bool parentChanged = existing?.ParentId != ticket.ParentId;
        if (parentChanged && !TicketRules.IsOpen(parent.Status))
        {
            throw new ArgumentException("The parent ticket is closed. Reopen it to add children.");
        }

        return parent;
    }

    // The sprint a ticket leaves and the one it enters. A completed sprint is history: nothing
    // leaves it and nothing enters it.
    private async Task EnsureSprintChangeIsAllowedAsync(int projectId, int? fromSprintId, int? toSprintId)
    {
        if (fromSprintId == toSprintId)
        {
            return;
        }

        if (await IsInCompletedSprintAsync(projectId, fromSprintId))
        {
            throw new ArgumentException("Tickets of a completed sprint can't change sprint.");
        }

        if (toSprintId is not null)
        {
            Sprint? sprint = await _sprintRepository.GetInProjectAsync(projectId, toSprintId.Value);
            if (sprint is null)
            {
                throw new ArgumentException("The sprint doesn't exist in this project.");
            }

            if (sprint.Status == SprintStatus.Completed)
            {
                throw new ArgumentException("Completed sprints can't receive tickets.");
            }
        }
    }

    private async Task<bool> IsInCompletedSprintAsync(int projectId, int? sprintId)
    {
        if (sprintId is null)
        {
            return false;
        }

        Sprint? sprint = await _sprintRepository.GetInProjectAsync(projectId, sprintId.Value);
        return sprint?.Status == SprintStatus.Completed;
    }

    // Tickets of a closed epic are read-only until the epic is reopened. No epic, nothing to check.
    private async Task EnsureEpicIsOpenAsync(int? epicId)
    {
        if (epicId is null)
        {
            return;
        }

        Epic? epic = await _epicRepository.GetByIdAsync(epicId.Value);
        if (epic?.Status == EpicStatus.Closed)
        {
            throw new ArgumentException("The epic is closed. Reopen it to make changes.");
        }
    }

    // The type's own fields. The lists are replaced whole: whatever the client sent is the list.
    private static void CopyTypeFields(Ticket from, Ticket to)
    {
        switch (from, to)
        {
            case (UserStory source, UserStory target):
                target.Points = source.Points;
                target.AcceptanceCriteria = source.AcceptanceCriteria;
                target.DefinitionOfReady = source.DefinitionOfReady;
                target.DefinitionOfDone = source.DefinitionOfDone;
                break;

            case (TicketTask source, TicketTask target):
                target.Points = source.Points;
                target.Checklist = source.Checklist;
                break;

            case (Bug source, Bug target):
                target.Severity = source.Severity;
                target.StepsToReproduce = source.StepsToReproduce;
                target.ExpectedResult = source.ExpectedResult;
                target.ActualResult = source.ActualResult;
                target.Environment = source.Environment;
                break;

            case (Fix source, Fix target):
                target.RootCause = source.RootCause;
                target.Solution = source.Solution;
                target.RegressionRisk = source.RegressionRisk;
                target.VerificationSteps = source.VerificationSteps;
                break;
        }
    }
}
