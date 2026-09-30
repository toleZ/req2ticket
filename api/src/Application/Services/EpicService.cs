using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class EpicService
{
    // With 32^8 possible codes, two collisions in a row would mean a bug, not bad luck.
    private const int MaxCodeAttempts = 5;

    private readonly IEpicRepository _epicRepository;
    private readonly IUserRepository _userRepository;

    public EpicService(IEpicRepository epicRepository, IUserRepository userRepository)
    {
        _epicRepository = epicRepository;
        _userRepository = userRepository;
    }

    public async Task<List<Epic>> GetAllAsync() =>
        await _epicRepository.GetAllAsync();

    public async Task<Epic?> GetByIdAsync(int id) =>
        await _epicRepository.GetByIdWithOwnerAsync(id);

    public async Task<Epic?> GetByCodeAsync(string code) =>
        await _epicRepository.GetByCodeAsync(code);

    public async Task<Epic> CreateAsync(Epic epic)
    {
        await EnsureOwnerExistsAsync(epic.OwnerId);

        epic.Code = await GenerateUniqueCodeAsync();

        await _epicRepository.AddAsync(epic);
        return epic;
    }

    public async Task<bool> UpdateAsync(int id, Epic changes)
    {
        Epic? epic = await _epicRepository.GetByIdAsync(id);
        if (epic is null)
        {
            return false;
        }

        await EnsureOwnerExistsAsync(changes.OwnerId);

        // Code is deliberately absent: it is assigned once on create and never updated.
        epic.Name = changes.Name;
        epic.Description = changes.Description;
        epic.AccentColor = changes.AccentColor;
        epic.Priority = changes.Priority;
        epic.Status = changes.Status;
        epic.OwnerId = changes.OwnerId;

        await _epicRepository.UpdateAsync(epic);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        Epic? epic = await _epicRepository.GetByIdAsync(id);
        if (epic is null)
        {
            return false;
        }

        await _epicRepository.DeleteAsync(id);
        return true;
    }

    // The pre-check is check-then-act, so the unique index is the real guarantee: two racing
    // writers get past this and the index stops them, as a 500 rather than a readable message.
    // Catching DbUpdateException would drag EF Core into Application, which only knows Domain.
    private async Task<string> GenerateUniqueCodeAsync()
    {
        for (int attempt = 0; attempt < MaxCodeAttempts; attempt++)
        {
            string code = EpicCode.Generate();
            if (!await _epicRepository.CodeExistsAsync(code))
            {
                return code;
            }
        }

        throw new InvalidOperationException("Could not generate a unique code for the epic.");
    }

    private async Task EnsureOwnerExistsAsync(int? ownerId)
    {
        if (ownerId is null)
        {
            return;
        }

        User? owner = await _userRepository.GetByIdAsync(ownerId.Value);
        if (owner is null)
        {
            throw new ArgumentException($"There is no user with Id {ownerId}.");
        }
    }
}
