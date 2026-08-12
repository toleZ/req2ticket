using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

// Read-only by design: users come from the seed, there is no sign-up through the API.
public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<User>> GetAllAsync() =>
        await _userRepository.GetAllAsync();

    public async Task<User?> GetByIdAsync(int id) =>
        await _userRepository.GetByIdAsync(id);
}
