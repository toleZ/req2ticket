using System.Text.Json.Serialization;

namespace Domain.Common;

// JsonStringEnumConverter accepts ints as well as names by default, so "priority": 2
// would quietly land as "high". The API speaks strings only: this subclass exists just
// to turn that off, since the [JsonConverter] attribute cannot pass constructor arguments.
public sealed class StringOnlyEnumConverter<TEnum> : JsonStringEnumConverter<TEnum>
    where TEnum : struct, Enum
{
    public StringOnlyEnumConverter() : base(namingPolicy: null, allowIntegerValues: false)
    {
    }
}
