using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

// Owns credentials only. Issuing the token is TokenService's job, so this class stays
// unaware of JWT and can be read as "is this password right" and nothing else.
public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly PasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepository, PasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    // Returns null when the credentials do not match. A failed login is normal flow,
    // not an exception. The same null covers "no such email" and "wrong password", so
    // the response can never be used to find out which emails exist.
    public async Task<User?> LoginAsync(string email, string password)
    {
        User? user = await _userRepository.GetByEmailAsync(email.Trim());
        if (user is null)
        {
            return null;
        }

        // Verify re-hashes the given password with the salt stored inside the hash and
        // compares in constant time, so the password never reaches SQL or the query log.
        return _passwordHasher.Verify(password, user.PasswordHash) ? user : null;
    }

    // New accounts get the lowest role. Handing out anything more is a deliberate act:
    // someone with the Admin policy has to change it afterwards.
    public async Task<User> RegisterAsync(string name, string email, string password)
    {
        string normalizedEmail = email.Trim();

        // Check-then-act, like EpicService does with the epic code: the unique index on
        // Email is the real guarantee, this is the part that produces a readable message.
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail))
        {
            throw new ArgumentException($"Ya existe un usuario con el email {normalizedEmail}.");
        }

        var user = new User
        {
            Name = name.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(password),
            Role = UserRole.Viewer
        };

        await _userRepository.AddAsync(user);
        return user;
    }
}
