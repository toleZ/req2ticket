using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;

namespace Application.Services;

public class EpicService
{
    private readonly IEpicRepository _epicRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IProjectMemberRepository _memberRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EpicService(
        IEpicRepository epicRepository,
        IProjectRepository projectRepository,
        IProjectMemberRepository memberRepository,
        ITicketRepository ticketRepository,
        IUnitOfWork unitOfWork)
    {
        _epicRepository = epicRepository;
        _projectRepository = projectRepository;
        _memberRepository = memberRepository;
        _ticketRepository = ticketRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<EpicSummary>> GetSummariesAsync(int projectId) =>
        await _epicRepository.GetSummariesAsync(projectId);

    public async Task<EpicSummary?> GetSummaryAsync(int projectId, int id) =>
        await _epicRepository.GetSummaryAsync(projectId, id);

    public async Task<Epic?> GetDetailAsync(int projectId, int id) =>
        await _epicRepository.GetDetailAsync(projectId, id);

    public async Task<Epic?> GetByCodeAsync(int projectId, string code) =>
        await _epicRepository.GetByCodeAsync(projectId, code.Trim().ToUpperInvariant());

    public async Task<Epic> CreateAsync(int projectId, Epic epic)
    {
        await EnsureOwnerIsMemberAsync(projectId, epic.OwnerId);

        // Nothing is open in a new epic, so creating it closed would be legal but pointless.
        if (epic.Status == EpicStatus.Closed)
        {
            throw new ArgumentException("A new epic can't start closed.");
        }

        Project project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new ArgumentException("Project not found.");

        // The number is taken and the epic inserted in one transaction: if the insert fails, the
        // counter goes back too.
        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        epic.ProjectId = projectId;
        epic.Number = await _projectRepository.TakeNextNumberAsync(projectId, NumberedKind.Epic);
        epic.Code = WorkItemCode.Format(project.Key, NumberedKind.Epic, epic.Number);

        await _epicRepository.AddAsync(epic);
        await transaction.CommitAsync();
        return epic;
    }

    public async Task<bool> UpdateAsync(int projectId, int id, Epic changes)
    {
        Epic? epic = await _epicRepository.GetInProjectAsync(projectId, id);
        if (epic is null)
        {
            return false;
        }

        await EnsureOwnerIsMemberAsync(projectId, changes.OwnerId);

        // An epic closes by hand, and only once every ticket in it is done or cancelled (DEC-5).
        if (changes.Status == EpicStatus.Closed && epic.Status != EpicStatus.Closed
            && await _ticketRepository.CountOpenInEpicAsync(id) > 0)
        {
            throw new ArgumentException("The epic still has open tickets.");
        }

        // Code, Number and ProjectId are deliberately absent: assigned once on create.
        epic.Name = changes.Name;
        epic.Description = changes.Description;
        epic.AccentColor = changes.AccentColor;
        epic.Priority = changes.Priority;
        epic.Status = changes.Status;
        epic.OwnerId = changes.OwnerId;

        await _epicRepository.UpdateAsync(epic);
        return true;
    }

    // Its tickets stay, without an epic: the database sets their EpicId to null.
    public async Task<bool> DeleteAsync(int projectId, int id)
    {
        Epic? epic = await _epicRepository.GetInProjectAsync(projectId, id);
        if (epic is null)
        {
            return false;
        }

        await _epicRepository.DeleteAsync(id);
        return true;
    }

    private async Task EnsureOwnerIsMemberAsync(int projectId, int? ownerId)
    {
        if (ownerId is not null && !await _memberRepository.IsMemberAsync(projectId, ownerId.Value))
        {
            throw new ArgumentException("The owner has to be a member of the project.");
        }
    }
}
