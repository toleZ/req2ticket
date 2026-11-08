using Domain.Entities;

namespace Domain.Common;

// The sequences a project numbers separately. Epics count on their own, and each ticket type too:
// the first bug of a project is BUG-1 no matter how many stories it has.
public enum NumberedKind
{
    Epic,
    UserStory,
    Task,
    Bug,
    Fix
}

/* {KEY}-{TYPE}-{N}: R2T-EPIC-1, R2T-UH-12, R2T-TASK-3, R2T-BUG-7, R2T-FIX-2. Readable, dictable,
   and unique across the whole platform because the key already is. The number comes from the
   project's counter (ProjectRepository.TakeNextNumberAsync), never from MAX(Number) + 1. */
public static class WorkItemCode
{
    // A 6-letter key, the longest prefix ("EPIC" or "TASK") and a 10-digit number fit with room.
    public const int MaxLength = 24;

    public static string Format(string projectKey, NumberedKind kind, int number) =>
        $"{projectKey}-{PrefixOf(kind)}-{number}";

    public static NumberedKind KindOf(TicketType type) => type switch
    {
        TicketType.UserStory => NumberedKind.UserStory,
        TicketType.Task => NumberedKind.Task,
        TicketType.Bug => NumberedKind.Bug,
        TicketType.Fix => NumberedKind.Fix,
        _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown ticket type.")
    };

    // "UH" and not "US": the team says historia de usuario.
    private static string PrefixOf(NumberedKind kind) => kind switch
    {
        NumberedKind.Epic => "EPIC",
        NumberedKind.UserStory => "UH",
        NumberedKind.Task => "TASK",
        NumberedKind.Bug => "BUG",
        NumberedKind.Fix => "FIX",
        _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, "Unknown sequence.")
    };
}
