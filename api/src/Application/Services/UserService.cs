using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

/* The platform's user directory, managed only by a SuperAdmin (the filter on UsersController
   decides that). Roles inside projects are not here: they are memberships, see MemberService.
   What remains here are the guards a SuperAdmin needs against themselves, and one for the
   projects: deleting a user never leaves a project without an Admin. */
public class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IProjectMemberRepository _memberRepository;
    private readonly PasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, IProjectMemberRepository memberRepository, PasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _memberRepository = memberRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<User>> GetAllAsync() =>
        await _userRepository.GetAllAsync();

    public async Task<User?> GetByIdAsync(int id) =>
        await _userRepository.GetByIdAsync(id);

    public async Task<User> CreateAsync(User user, string password)
    {
        string email = user.Email.Trim().ToLowerInvariant();

        // Check-then-act: the unique index is the real guarantee, this is the readable message.
        if (await _userRepository.ExistsByEmailAsync(email))
        {
            throw new ArgumentException($"A user with the email {email} already exists.");
        }

        user.Name = user.Name.Trim();
        user.Email = email;
        user.PasswordHash = _passwordHasher.Hash(password);

        await _userRepository.AddAsync(user);
        return user;
    }

    public async Task<bool> UpdateAsync(int id, int actorId, User changes, string? newPassword)
    {
        User? user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            return false;
        }

        if (changes.PlatformRole != user.PlatformRole)
        {
            // Demoting yourself is the mistake with no way back: undoing it needs the role given up.
            if (user.Id == actorId)
            {
                throw new UnauthorizedAccessException("You can't change your own platform role.");
            }

            await EnsureNotLastSuperAdminAsync(user);
        }

        string email = changes.Email.Trim().ToLowerInvariant();
        if (!string.Equals(email, user.Email, StringComparison.Ordinal)
            && await _userRepository.ExistsByEmailAsync(email))
        {
            throw new ArgumentException($"A user with the email {email} already exists.");
        }

        user.Name = changes.Name.Trim();
        user.Email = email;
        user.PlatformRole = changes.PlatformRole;

        // Absent means "leave it as it is": the client never receives the password to send it back.
        if (!string.IsNullOrEmpty(newPassword))
        {
            user.PasswordHash = _passwordHasher.Hash(newPassword);
        }

        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, int actorId)
    {
        User? user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            return false;
        }

        if (user.Id == actorId)
        {
            throw new UnauthorizedAccessException("You can't delete your own account.");
        }

        await EnsureNotLastSuperAdminAsync(user);

        // The same rule as removing a member (MemberService), across every project at once.
        List<string> onlyAdminOf = await _memberRepository.GetKeysWhereOnlyAdminAsync(id);
        if (onlyAdminOf.Count > 0)
        {
            throw new ArgumentException(
                $"{user.Name} is the only Admin of {string.Join(", ", onlyAdminOf)}. Assign another Admin first.");
        }

        await _userRepository.DeleteAsync(id);
        return true;
    }

    // Without a SuperAdmin nobody could hand the role out again.
    private async Task EnsureNotLastSuperAdminAsync(User user)
    {
        if (user.PlatformRole == PlatformRole.SuperAdmin
            && await _userRepository.CountByRoleAsync(PlatformRole.SuperAdmin) <= 1)
        {
            throw new UnauthorizedAccessException("The platform needs at least one SuperAdmin.");
        }
    }
}
