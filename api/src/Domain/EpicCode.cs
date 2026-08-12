using System.Security.Cryptography;

namespace Domain;

// Crockford-style base32: no I, L, O or U, so a code can never be misread or
// mis-dictated. 32^8 is roughly 1.1e12 combinations.
public static class EpicCode
{
    private const string Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private const string Prefix = "EPIC-";
    private const int RandomLength = 8;

    // "EPIC-" plus the random part.
    public const int Length = 13;

    // GetItems draws from a CSPRNG and has no modulo bias, unlike hashing bytes by hand.
    public static string Generate() =>
        string.Concat(Prefix, new string(RandomNumberGenerator.GetItems<char>(Alphabet, RandomLength)));
}
