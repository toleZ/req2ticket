using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

// Owns credentials and the caller's own account. Issuing the token is TokenService's job.
public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepository, PasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    // Null when the credentials do not match. The same null covers "no such email" and "wrong
    // password", so the response never tells which emails exist.
    public async Task<User?> LoginAsync(string email, string password)
    {
        User? user = await _userRepository.GetByEmailAsync(email.Trim().ToLowerInvariant());
        if (user is null)
        {
            return null;
        }

        return _passwordHasher.Verify(password, user.PasswordHash) ? user : null;
    }

    // A new account is a plain user with no projects: it can create one, or wait to be added.
    public async Task<User> RegisterAsync(string name, string email, string password)
    {
        string normalizedEmail = email.Trim().ToLowerInvariant();

        if (await _userRepository.ExistsByEmailAsync(normalizedEmail))
        {
            throw new ArgumentException($"A user with the email {normalizedEmail} already exists.");
        }

        var user = new User
        {
            Name = name.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(password),
            PlatformRole = PlatformRole.User
        };

        await _userRepository.AddAsync(user);
        return user;
    }

    public async Task<User?> UpdateNameAsync(int userId, string name)
    {
        User? user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return null;
        }

        user.Name = name.Trim();
        await _userRepository.UpdateAsync(user);
        return user;
    }

    // The other sessions keep their tokens until they expire; closing them is a separate feature.
    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        User? user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        if (!_passwordHasher.Verify(currentPassword, user.PasswordHash))
        {
            throw new ArgumentException("Current password is incorrect.");
        }

        if (currentPassword == newPassword)
        {
            throw new ArgumentException("The new password must be different from the current one.");
        }

        user.PasswordHash = _passwordHasher.Hash(newPassword);
        await _userRepository.UpdateAsync(user);
        return true;
    }
}
