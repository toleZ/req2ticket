using System.Text.Json;
using Domain.Entities;

namespace Domain.Common;

// The API speaks roles as strings ("productOwner"). The JWT claim and the authorization
// policies both need those exact spellings, and deriving them from the enum's own converter
// is what keeps them from drifting into a second hardcoded list: rename a member of UserRole
// and everything follows.
public static class RoleNames
{
    public static string Of(UserRole role) => JsonSerializer.Serialize(role).Trim('"');

    public static string[] AllExcept(params UserRole[] excluded) =>
        Enum.GetValues<UserRole>()
            .Except(excluded)
            .Select(Of)
            .ToArray();
}
