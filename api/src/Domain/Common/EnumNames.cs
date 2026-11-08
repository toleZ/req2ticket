using System.Text.Json;

namespace Domain.Common;

// The API speaks enums as strings ("productOwner", "tickets.write"). Deriving them from the enum's
// own converter keeps every place that needs the spelling — the JWT claim, messages — from
// drifting into a second hardcoded list.
public static class EnumNames
{
    public static string Of<TEnum>(TEnum value) where TEnum : struct, Enum =>
        JsonSerializer.Serialize(value).Trim('"');
}
