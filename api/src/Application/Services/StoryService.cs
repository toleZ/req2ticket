using Domain;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class StoryService
{
    // With 32^8 possible codes, two collisions in a row would mean a bug, not bad luck.
    private const int MaxCodeAttempts = 5;

    private readonly IStoryRepository _storyRepository;
    private readonly IEpicRepository _epicRepository;
    private readonly IUserRepository _userRepository;

    public StoryService(IStoryRepository storyRepository, IEpicRepository epicRepository, IUserRepository userRepository)
    {
        _storyRepository = storyRepository;
        _epicRepository = epicRepository;
        _userRepository = userRepository;
    }

    public async Task<List<Story>> GetAllAsync() =>
        await _storyRepository.GetAllAsync();

    public async Task<Story?> GetByIdAsync(int id) =>
        await _storyRepository.GetByIdWithRelationsAsync(id);

    public async Task<Story?> GetByCodeAsync(string code) =>
        await _storyRepository.GetByCodeAsync(code);

    public async Task<Story> CreateAsync(Story story)
    {
        await EnsureEpicExistsAsync(story.EpicId);
        await EnsureAssigneeExistsAsync(story.AssigneeId);

        story.Code = await GenerateUniqueCodeAsync();

        await _storyRepository.AddAsync(story);
        return story;
    }

    // Returns false when the story does not exist.
    public async Task<bool> UpdateAsync(int id, Story changes)
    {
        Story? story = await _storyRepository.GetByIdAsync(id);
        if (story is null)
        {
            return false;
        }

        await EnsureEpicExistsAsync(changes.EpicId);
        await EnsureAssigneeExistsAsync(changes.AssigneeId);

        // Code is deliberately absent: it is assigned once on create and never updated.
        story.Title = changes.Title;
        story.Description = changes.Description;
        story.EpicId = changes.EpicId;
        story.Priority = changes.Priority;
        story.Status = changes.Status;
        story.Points = changes.Points;
        story.AssigneeId = changes.AssigneeId;
        story.CriteriaTotal = changes.CriteriaTotal;
        story.CriteriaDone = changes.CriteriaDone;

        await _storyRepository.UpdateAsync(story);
        return true;
    }

    // Returns false when the story does not exist.
    public async Task<bool> DeleteAsync(int id)
    {
        Story? story = await _storyRepository.GetByIdAsync(id);
        if (story is null)
        {
            return false;
        }

        await _storyRepository.DeleteAsync(id);
        return true;
    }

    // The pre-check is check-then-act, so the unique index is the real guarantee. For a
    // single-process SQLite app that is enough; catching DbUpdateException here would drag
    // EF Core into Application, which only references Domain.
    private async Task<string> GenerateUniqueCodeAsync()
    {
        for (int attempt = 0; attempt < MaxCodeAttempts; attempt++)
        {
            string code = StoryCode.Generate();
            if (!await _storyRepository.CodeExistsAsync(code))
            {
                return code;
            }
        }

        throw new InvalidOperationException("No se pudo generar un código único para la historia.");
    }

    private async Task EnsureEpicExistsAsync(int epicId)
    {
        Epic? epic = await _epicRepository.GetByIdAsync(epicId);
        if (epic is null)
        {
            throw new ArgumentException($"No existe una épica con Id {epicId}.");
        }
    }

    private async Task EnsureAssigneeExistsAsync(int? assigneeId)
    {
        if (assigneeId is null)
        {
            return;
        }

        User? assignee = await _userRepository.GetByIdAsync(assigneeId.Value);
        if (assignee is null)
        {
            throw new ArgumentException($"No existe un usuario con Id {assigneeId}.");
        }
    }
}
