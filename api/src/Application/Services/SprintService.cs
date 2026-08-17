using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class SprintService
{
    private readonly ISprintRepository _sprintRepository;

    public SprintService(ISprintRepository sprintRepository)
    {
        _sprintRepository = sprintRepository;
    }

    public async Task<List<Sprint>> GetAllAsync() =>
        await _sprintRepository.GetAllAsync();

    public async Task<Sprint?> GetByIdAsync(int id) =>
        await _sprintRepository.GetByIdAsync(id);

    public async Task<Sprint> CreateAsync(Sprint sprint)
    {
        await ValidateAsync(sprint, excludeId: null);

        await _sprintRepository.AddAsync(sprint);
        return sprint;
    }

    // Returns false when the sprint does not exist.
    public async Task<bool> UpdateAsync(int id, Sprint changes)
    {
        Sprint? sprint = await _sprintRepository.GetByIdAsync(id);
        if (sprint is null)
        {
            return false;
        }

        await ValidateAsync(changes, excludeId: id);

        sprint.Name = changes.Name;
        sprint.Goal = changes.Goal;
        sprint.StartDate = changes.StartDate;
        sprint.EndDate = changes.EndDate;
        sprint.Capacity = changes.Capacity;
        sprint.Status = changes.Status;

        await _sprintRepository.UpdateAsync(sprint);
        return true;
    }

    // Returns false when the sprint does not exist.
    public async Task<bool> DeleteAsync(int id)
    {
        Sprint? sprint = await _sprintRepository.GetByIdAsync(id);
        if (sprint is null)
        {
            return false;
        }

        await _sprintRepository.DeleteAsync(id);
        return true;
    }

    private async Task ValidateAsync(Sprint sprint, int? excludeId)
    {
        if (sprint.EndDate < sprint.StartDate)
        {
            throw new ArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }

        if (sprint.Status == SprintStatus.Active && await _sprintRepository.HasActiveSprintAsync(excludeId))
        {
            throw new ArgumentException("Ya hay un sprint activo.");
        }
    }
}
