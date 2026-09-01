using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Unicode;
using Domain.Entities;

namespace Application.Validation;

// What each ticket type may carry in its ExtraFields, and the rule every field obeys.
//
// The schema is data, not four class definitions. That is deliberate: nothing in the app ever
// consumes the extras as typed C# objects — TicketResponse re-parses the stored text with
// JsonDocument and hands it straight to the client — so records bought compile-time safety
// nobody used, in exchange for four types that lived in Entities/ and read like tables.
//
// Written this way it is also the same shape the front end already uses in
// web/src/lib/ticketExtraFields.js, so both sides finally describe the schema the same way.
// If you add a field here, add it there too.
//
// This is not a service: it has no state and no dependencies, and it is not in DI.
// TicketService calls it on the two paths that write.
internal enum ExtraKind
{
    Text,
    Enum,
    Checklist
}

// MaxLength applies to Text. EnumType and Default apply to Enum. Checklist needs neither — its
// shape is always a list of { text, done }.
internal sealed record ExtraField(
    string Key,
    ExtraKind Kind,
    int MaxLength = 0,
    Type? EnumType = null,
    string? Default = null);

public static class TicketExtrasValidator
{
    private const int MaxChecklistItems = 30;
    private const int MaxChecklistTextLength = 300;

    /* The default encoder escapes everything above ASCII, so "planificación" would be stored as
       "planificación" — correct JSON, unreadable in a database browser, and different from
       the seed rows, which reach the database as C# literals without passing through here. Two
       spellings of the same text in one column is a trap for anyone diffing them.

       UnicodeRanges.All lets the accents through while still escaping the HTML-sensitive
       characters (< > & ' +), unlike UnsafeRelaxedJsonEscaping. Nothing here is written into a
       page, but there is no reason to give that up for a readability fix. */
    private static readonly JsonSerializerOptions WriteOptions = new()
    {
        Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)
    };

    // Order matters: it is the order the keys come out in, which is what keeps two tickets of
    // the same type comparable.
    private static readonly Dictionary<TicketType, ExtraField[]> Schema = new()
    {
        [TicketType.UserStory] =
        [
            new("acceptanceCriteria", ExtraKind.Checklist),
            new("definitionOfReady", ExtraKind.Checklist),
            new("definitionOfDone", ExtraKind.Checklist),
        ],

        [TicketType.Task] =
        [
            new("checklist", ExtraKind.Checklist),
        ],

        [TicketType.Bug] =
        [
            // "minor" and not default(BugSeverity): the enum is declared blocker-first, so the
            // zero value is Blocker. A bug that arrives without a severity is minor, not a
            // blocker — reading the default off the declaration order would silently escalate
            // every one of them.
            new("severity", ExtraKind.Enum, EnumType: typeof(BugSeverity), Default: "minor"),
            new("stepsToReproduce", ExtraKind.Text, MaxLength: 2000),
            new("expectedResult", ExtraKind.Text, MaxLength: 1000),
            new("actualResult", ExtraKind.Text, MaxLength: 1000),
            new("environment", ExtraKind.Text, MaxLength: 200),
        ],

        [TicketType.Fix] =
        [
            new("rootCause", ExtraKind.Text, MaxLength: 2000),
            new("solution", ExtraKind.Text, MaxLength: 2000),
            new("verificationSteps", ExtraKind.Checklist),
            new("regressionRisk", ExtraKind.Enum, EnumType: typeof(RegressionRisk), Default: "low"),
        ],
    };

    /// <summary>
    /// Takes the JSON exactly as it arrived and returns the canonical text to store, or null
    /// when the ticket carries no extras at all. Throws ArgumentException on anything invalid,
    /// which is the currency every service here deals in and every controller turns into a 400.
    /// </summary>
    public static string? Normalize(TicketType type, string? rawJson)
    {
        // Absent, "null" and whitespace all mean the same thing: nothing filled in yet.
        if (string.IsNullOrWhiteSpace(rawJson) || rawJson == "null")
        {
            return null;
        }

        if (!Schema.TryGetValue(type, out ExtraField[]? fields))
        {
            throw new ArgumentException($"Tipo de ticket desconocido: {type}.");
        }

        JsonObject incoming = Parse(rawJson);
        RejectUnknownKeys(incoming, fields);

        // Built key by key from the schema rather than copied from the input. That is what
        // "normalize" means here: the same keys in the same order for every ticket of one type,
        // whatever order the client sent them in.
        var canonical = new JsonObject();
        foreach (ExtraField field in fields)
        {
            JsonNode? value = incoming[field.Key];

            switch (field.Kind)
            {
                case ExtraKind.Text:
                    // Absent stays absent: an empty key is noise in a document meant to be diffed.
                    if (value is not null)
                    {
                        canonical[field.Key] = JsonValue.Create(ReadText(field, value));
                    }

                    break;

                case ExtraKind.Enum:
                    // Always written, falling back to the declared default, so every ticket of
                    // this type has the key and comparing two of them never trips on a gap.
                    canonical[field.Key] = JsonValue.Create(ReadEnum(field, value));
                    break;

                case ExtraKind.Checklist:
                    // Always written too, as [] when empty.
                    canonical[field.Key] = ReadChecklist(field, value);
                    break;
            }
        }

        return canonical.ToJsonString(WriteOptions);
    }

    private static JsonObject Parse(string rawJson)
    {
        JsonNode? node;
        try
        {
            node = JsonNode.Parse(rawJson);
        }
        catch (JsonException ex)
        {
            throw new ArgumentException($"extraFields inválido: {ex.Message}");
        }

        return node as JsonObject
            ?? throw new ArgumentException("extraFields debe ser un objeto JSON.");
    }

    // A key the type does not declare is a typo, or a client that got ahead of the API. Dropping
    // it silently loses data nobody can see they lost, so it is named and refused — the same
    // reasoning as StringOnlyEnumConverter refusing "priority": 2 instead of reading it as high.
    private static void RejectUnknownKeys(JsonObject incoming, ExtraField[] fields)
    {
        foreach (KeyValuePair<string, JsonNode?> pair in incoming)
        {
            if (!fields.Any(field => field.Key == pair.Key))
            {
                throw new ArgumentException(
                    $"extraFields inválido: la clave '{pair.Key}' no pertenece a este tipo de ticket.");
            }
        }
    }

    private static string ReadText(ExtraField field, JsonNode value)
    {
        if (value.GetValueKind() != JsonValueKind.String)
        {
            throw new ArgumentException($"extraFields inválido: '{field.Key}' debe ser texto.");
        }

        string text = value.GetValue<string>();
        if (text.Length > field.MaxLength)
        {
            throw new ArgumentException(
                $"extraFields inválido: '{field.Key}' no puede superar los {field.MaxLength} caracteres.");
        }

        return text;
    }

    // Deserializing into the enum type rather than comparing strings by hand: the
    // [JsonConverter(typeof(StringOnlyEnumConverter<T>))] on the enum is honoured here, so the
    // [JsonStringEnumMemberName] spellings stay the single source of the allowed values and an
    // integer is still refused. Re-serializing turns it back into the canonical spelling.
    private static string ReadEnum(ExtraField field, JsonNode? value)
    {
        if (value is null)
        {
            return field.Default!;
        }

        try
        {
            object? parsed = value.Deserialize(field.EnumType!);
            return JsonSerializer.Serialize(parsed, field.EnumType!).Trim('"');
        }
        catch (JsonException)
        {
            string allowed = string.Join(" | ", Enum.GetNames(field.EnumType!)
                .Select(name => JsonSerializer.Serialize(Enum.Parse(field.EnumType!, name), field.EnumType!).Trim('"')));

            throw new ArgumentException(
                $"extraFields inválido: '{field.Key}' debe ser uno de: {allowed}.");
        }
    }

    private static JsonArray ReadChecklist(ExtraField field, JsonNode? value)
    {
        if (value is null)
        {
            return [];
        }

        if (value is not JsonArray items)
        {
            throw new ArgumentException($"extraFields inválido: '{field.Key}' debe ser una lista.");
        }

        if (items.Count > MaxChecklistItems)
        {
            throw new ArgumentException(
                $"extraFields inválido: '{field.Key}' no puede tener más de {MaxChecklistItems} ítems.");
        }

        var canonical = new JsonArray();
        foreach (JsonNode? item in items)
        {
            if (item is not JsonObject entry)
            {
                throw new ArgumentException(
                    $"extraFields inválido: cada ítem de '{field.Key}' debe ser un objeto {{ text, done }}.");
            }

            string text = entry["text"]?.GetValueKind() == JsonValueKind.String
                ? entry["text"]!.GetValue<string>()
                : throw new ArgumentException(
                    $"extraFields inválido: cada ítem de '{field.Key}' necesita un 'text'.");

            if (text.Length is 0 or > MaxChecklistTextLength)
            {
                throw new ArgumentException(
                    $"extraFields inválido: el texto de un ítem de '{field.Key}' debe tener entre 1 y {MaxChecklistTextLength} caracteres.");
            }

            JsonValueKind doneKind = entry["done"]?.GetValueKind() ?? JsonValueKind.False;
            if (doneKind is not (JsonValueKind.True or JsonValueKind.False))
            {
                throw new ArgumentException(
                    $"extraFields inválido: el 'done' de un ítem de '{field.Key}' debe ser true o false.");
            }

            // Rebuilt rather than reused, so an item never carries a key the shape does not have.
            canonical.Add(new JsonObject
            {
                ["text"] = text,
                ["done"] = doneKind == JsonValueKind.True,
            });
        }

        return canonical;
    }
}
