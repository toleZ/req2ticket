using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WorkflowRepository : IWorkflowRepository
{
    private readonly Req2TicketContext _context;

    public WorkflowRepository(Req2TicketContext context)
    {
        _context = context;
    }

    public async Task<Workflow?> GetByProjectAsync(int projectId) =>
        await _context.Workflows
            .Include(w => w.Transitions)
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.ProjectId == projectId);

    /* Replacing is "delete the old transitions, insert the new ones". The delete runs as its own
       statement first: removing and re-adding rows with the same key in one SaveChanges would
       collide in the change tracker. Call it inside a transaction (WorkflowService does). */
    public async Task SaveAsync(int projectId, List<WorkflowTransition> transitions, DateTimeOffset updatedAt)
    {
        Workflow? workflow = await _context.Workflows.FirstOrDefaultAsync(w => w.ProjectId == projectId);

        if (workflow is null)
        {
            workflow = new Workflow { ProjectId = projectId, UpdatedAt = updatedAt, Transitions = transitions };
            await _context.Workflows.AddAsync(workflow);
            await _context.SaveChangesAsync();
            return;
        }

        await _context.Set<WorkflowTransition>()
            .Where(t => t.WorkflowId == workflow.Id)
            .ExecuteDeleteAsync();

        foreach (WorkflowTransition transition in transitions)
        {
            transition.WorkflowId = workflow.Id;
        }

        await _context.Set<WorkflowTransition>().AddRangeAsync(transitions);
        workflow.UpdatedAt = updatedAt;
        await _context.SaveChangesAsync();
    }

    // The transitions go with it (cascade).
    public async Task<bool> DeleteByProjectAsync(int projectId) =>
        await _context.Workflows
            .Where(w => w.ProjectId == projectId)
            .ExecuteDeleteAsync() > 0;
}
