using System.Security.Cryptography;

namespace Domain;

// Same Crockford-style base32 as EpicCode, just a different prefix so a code makes
// it obvious at a glance whether it names a story or an epic.
public static class StoryCode
{
    private const string Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private const string Prefix = "STORY-";
    private const int RandomLength = 8;

    // "STORY-" plus the random part.
    public const int Length = 14;

    public static string Generate() =>
        string.Concat(Prefix, new string(RandomNumberGenerator.GetItems<char>(Alphabet, RandomLength)));
}
