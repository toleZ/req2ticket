using Domain.Entities;

namespace Domain.Interfaces;

public interface ISprintRepository : IBaseRepository<Sprint>
{
    Task<bool> HasActiveSprintAsync(int? excludeId);
}
