using Domain.Entities;

namespace Domain.Interfaces;

public interface IWorkflowRepository
{
    // With its transitions, read-only. Null means the project moves freely.
    Task<Workflow?> GetByProjectAsync(int projectId);

    // Creates the workflow or replaces every transition of the existing one.
    Task SaveAsync(int projectId, List<WorkflowTransition> transitions, DateTimeOffset updatedAt);

    Task<bool> DeleteByProjectAsync(int projectId);
}
