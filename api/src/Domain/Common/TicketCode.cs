using System.Security.Cryptography;
using Domain.Entities;

namespace Domain.Common;

// Same Crockford-style base32 as EpicCode, but the prefix comes from the ticket's type, so
// a code says at a glance what kind of work item it names — and never gets confused with an
// epic's.
//
// This is what makes Ticket.Type immutable: the code is assigned once and never changes, so
// a ticket that could switch type would end up carrying a BUG- code on a task.
public static class TicketCode
{
    private const string Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    private const int RandomLength = 8;

    // The longest prefix ("TASK-", 5 characters) plus the random part. One maximum for every
    // type, since they all share the same column.
    public const int MaxLength = 13;

    public static string Generate(TicketType type) =>
        string.Concat(PrefixOf(type), new string(RandomNumberGenerator.GetItems<char>(Alphabet, RandomLength)));

    // "UH" and not "US": the UI is in Spanish and the team says historia de usuario.
    private static string PrefixOf(TicketType type) => type switch
    {
        TicketType.UserStory => "UH-",
        TicketType.Task => "TASK-",
        TicketType.Bug => "BUG-",
        TicketType.Fix => "FIX-",
        _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Tipo de ticket desconocido.")
    };
}
