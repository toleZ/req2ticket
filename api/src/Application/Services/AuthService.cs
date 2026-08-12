using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

// Simulated authentication: no hashing, no token, no session. It only answers whether
// the email and password match a row in the database.
public class AuthService
{
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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

        // Compared in memory rather than in the WHERE clause, so the password never
        // reaches SQL or the EF query log.
        return string.Equals(user.Password, password, StringComparison.Ordinal)
            ? user
            : null;
    }
}
