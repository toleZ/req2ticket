namespace Application.Services;

// Wraps BCrypt so the rest of the code never names the algorithm. Swapping it later means
// touching this file and re-hashing the stored values, nothing else.
public class PasswordHasher
{
    // Cost 11 means 2^11 rounds. Enough to make a stolen hash expensive to attack, cheap
    // enough that a login does not feel slow. Raising it invalidates nothing: the cost is
    // stored inside each hash, so old hashes keep verifying with the cost they were made with.
    private const int WorkFactor = 11;

    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    // Returns false instead of throwing when the stored value is not a valid BCrypt hash,
    // so a corrupt row is a failed login and not a 500.
    public bool Verify(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }
}
