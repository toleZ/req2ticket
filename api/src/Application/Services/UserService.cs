using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

// Who may touch whom is the only real difference between admin and superAdmin, and that rule
// lives here rather than in a policy: a policy only knows the role of the caller, and the rule
// also needs the role of the target. "May edit users" is settled at the door by
// CanManageUsers; "may edit THIS user" can only be settled here.
public class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, PasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<User>> GetAllAsync() =>
        await _userRepository.GetAllAsync();

    public async Task<User?> GetByIdAsync(int id) =>
        await _userRepository.GetByIdAsync(id);

    // actorId comes from the token in the controller: "who is logged in" is an HTTP fact and
    // Application has no HttpContext, the same reasoning TicketsController applies to ReporterId.
    public async Task<User> CreateAsync(int? actorId, User nuevo, string password)
    {
        User actor = await LoadActorAsync(actorId);
        EnsureCanActOn(actor, nuevo.Role, "asignar el rol");

        string email = nuevo.Email.Trim().ToLowerInvariant();

        // Check-then-act: the unique index is the real guarantee, this is the readable message.
        if (await _userRepository.ExistsByEmailAsync(email))
        {
            throw new ArgumentException($"Ya existe un usuario con el email {email}.");
        }

        nuevo.Name = nuevo.Name.Trim();
        nuevo.Email = email;
        nuevo.PasswordHash = _passwordHasher.Hash(password);

        await _userRepository.AddAsync(nuevo);
        return nuevo;
    }

    // Full replacement: every field is overwritten.
    public async Task<bool> UpdateAsync(int id, int? actorId, User changes, string? newPassword)
    {
        User actor = await LoadActorAsync(actorId);

        User? user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            return false;
        }

        /* Everything is validated before a single field is assigned, and not for tidiness:
           GetByIdAsync returns the entity tracked by EF, so when someone edits themselves actor
           and user are THE SAME object. Assigning the new role early would make the checks below
           read the role being set instead of the one actually held, and an admin could promote
           themselves. */
        EnsureCanActOn(actor, user.Role, "editar a un usuario con el rol");

        if (changes.Role != user.Role)
        {
            EnsureCanActOn(actor, changes.Role, "asignar el rol");

            // Upwards it would be self-promotion; downwards it is the mistake there is no way
            // back from, because undoing it needs the role just given up.
            if (user.Id == actor.Id)
            {
                throw new UnauthorizedAccessException("No podés cambiar tu propio rol.");
            }

            await EnsureNotLastSuperAdminAsync(user, "degradar");
        }

        // Ordinal, not OrdinalIgnoreCase: both sides are lowercase already, and if a row ever
        // is not, IgnoreCase would call this "unchanged", skip the check and let the index 500.
        string email = changes.Email.Trim().ToLowerInvariant();
        if (!string.Equals(email, user.Email, StringComparison.Ordinal)
            && await _userRepository.ExistsByEmailAsync(email))
        {
            throw new ArgumentException($"Ya existe un usuario con el email {email}.");
        }

        user.Name = changes.Name.Trim();
        user.Email = email;
        user.Role = changes.Role;

        // The one field a full replacement leaves alone when absent. See UserUpdateRequest.
        if (!string.IsNullOrEmpty(newPassword))
        {
            user.PasswordHash = _passwordHasher.Hash(newPassword);
        }

        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, int? actorId)
    {
        User actor = await LoadActorAsync(actorId);

        User? user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            return false;
        }

        if (user.Id == actor.Id)
        {
            throw new UnauthorizedAccessException("No podés borrarte a vos mismo.");
        }

        EnsureCanActOn(actor, user.Role, "borrar a un usuario con el rol");
        await EnsureNotLastSuperAdminAsync(user, "borrar");

        await _userRepository.DeleteAsync(id);
        return true;
    }

    /* The rule, in full. UserRole is declared from least to most privilege, so comparing the
       ordinals IS comparing privilege — that order was already information, this only uses it.

       The ceiling is strict for everyone except the top: an admin cannot touch another admin,
       but a superAdmin can touch another superAdmin. Without that exception a superAdmin would
       be permanent, because nobody above them exists to remove them. */
    private static bool CanActOn(UserRole actor, UserRole target) =>
        actor == UserRole.SuperAdmin || (int)target < (int)actor;

    private static void EnsureCanActOn(User actor, UserRole target, string accion)
    {
        if (!CanActOn(actor.Role, target))
        {
            throw new UnauthorizedAccessException(
                $"Un {RoleNames.Of(actor.Role)} no puede {accion} {RoleNames.Of(target)}.");
        }
    }

    /* Belt and braces: unreachable today. Deleting or demoting a superAdmin requires being one,
       and when only one is left the caller IS the target, so the two self-guards above stop it
       first. It stays because the invariant outlives them: allow deleting your own account, or
       add a role above superAdmin, and this becomes the only thing keeping the system from
       having nobody able to hand the role out. */
    private async Task EnsureNotLastSuperAdminAsync(User user, string accion)
    {
        if (user.Role != UserRole.SuperAdmin)
        {
            return;
        }

        if (await _userRepository.CountByRoleAsync(UserRole.SuperAdmin) <= 1)
        {
            throw new UnauthorizedAccessException(
                $"No se puede {accion} al único superAdmin: nadie podría volver a crear uno.");
        }
    }

    /* Read from the database and not from the token claim: the token lasts eight hours, so a
       demoted user's claim would keep its old role until it expires. Reading the row makes a
       role change take effect from the very next request. */
    private async Task<User> LoadActorAsync(int? actorId)
    {
        User? actor = actorId is null ? null : await _userRepository.GetByIdAsync(actorId.Value);

        // Valid token, missing row: the account was deleted mid-session.
        return actor ?? throw new UnauthorizedAccessException("El usuario autenticado ya no existe.");
    }
}
