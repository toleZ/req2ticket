using Domain.Entities;
using Domain.Interfaces;
using Domain.ReadModels;

namespace Application.Services;

// The members of a project and their roles (PAGE-1). The one rule that is not a permission: a
// project always keeps at least one Admin, or nobody could manage it again.
public class MemberService
{
    private readonly IProjectMemberRepository _memberRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IEpicRepository _epicRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MemberService(
        IProjectMemberRepository memberRepository,
        IUserRepository userRepository,
        ITicketRepository ticketRepository,
        IEpicRepository epicRepository,
        IUnitOfWork unitOfWork)
    {
        _memberRepository = memberRepository;
        _userRepository = userRepository;
        _ticketRepository = ticketRepository;
        _epicRepository = epicRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<MemberSummary>> GetAllAsync(int projectId) =>
        await _memberRepository.GetSummariesAsync(projectId);

    // People join by email and have to be registered already. Inviting someone new is EMAIL-1.
    public async Task<MemberSummary> AddAsync(int projectId, string email, ProjectRole role)
    {
        User? user = await _userRepository.GetByEmailAsync(email.Trim().ToLowerInvariant());
        if (user is null)
        {
            throw new ArgumentException("No user registered with that email.");
        }

        if (await _memberRepository.IsMemberAsync(projectId, user.Id))
        {
            throw new ArgumentException("User is already a member.");
        }

        await _memberRepository.AddAsync(new ProjectMember { ProjectId = projectId, UserId = user.Id, Role = role });

        return (await _memberRepository.GetSummaryAsync(projectId, user.Id))!;
    }

    // Null when the user is not a member of this project.
    public async Task<MemberSummary?> ChangeRoleAsync(int projectId, int userId, ProjectRole role)
    {
        ProjectMember? member = await _memberRepository.GetAsync(projectId, userId);
        if (member is null)
        {
            return null;
        }

        if (member.Role == ProjectRole.Admin && role != ProjectRole.Admin)
        {
            await EnsureNotLastAdminAsync(projectId);
        }

        member.Role = role;
        await _memberRepository.UpdateAsync(member);

        return await _memberRepository.GetSummaryAsync(projectId, userId);
    }

    /* Removing someone leaves their tickets and epics in THIS project without an assignee or owner;
       their work in other projects is untouched. Whoever they reported stays: that is history. All
       of it in one transaction, so a failure never leaves half the tickets unassigned. */
    public async Task<bool> RemoveAsync(int projectId, int userId)
    {
        await using ITransactionScope transaction = await _unitOfWork.BeginTransactionAsync();

        ProjectMember? member = await _memberRepository.GetAsync(projectId, userId);
        if (member is null)
        {
            return false;
        }

        if (member.Role == ProjectRole.Admin)
        {
            await EnsureNotLastAdminAsync(projectId);
        }

        await _ticketRepository.UnassignAsync(projectId, userId);
        await _epicRepository.ClearOwnerAsync(projectId, userId);
        await _memberRepository.RemoveAsync(member);

        await transaction.CommitAsync();
        return true;
    }

    private async Task EnsureNotLastAdminAsync(int projectId)
    {
        if (await _memberRepository.CountWithRoleAsync(projectId, ProjectRole.Admin) <= 1)
        {
            throw new ArgumentException("A project needs at least one Admin.");
        }
    }
}
