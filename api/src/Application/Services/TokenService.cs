using Domain.Common;
using Domain.Entities;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Text;

namespace Application.Services;

// Built by Program.cs from configuration. Validating there instead of here means a missing
// key stops the app at startup, not at the first login attempt.
public sealed record JwtSettings(string Key, string Issuer, string Audience, int ExpiresHours);

public class TokenService
{
    private static readonly JsonWebTokenHandler Handler = new();

    private readonly JwtSettings _settings;
    private readonly SigningCredentials _credentials;

    public TokenService(JwtSettings settings)
    {
        _settings = settings;
        _credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key)),
            SecurityAlgorithms.HmacSha256);
    }

    public (string Token, DateTime ExpiresAt) Create(User user)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(_settings.ExpiresHours);

        // Short claim names on purpose. Program.cs turns off inbound claim mapping, so they
        // arrive on the server spelled exactly like this instead of as SOAP-era URIs.
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _settings.Issuer,
            Audience = _settings.Audience,
            Expires = expiresAt,
            SigningCredentials = _credentials,
            Claims = new Dictionary<string, object>
            {
                ["sub"] = user.Id.ToString(CultureInfo.InvariantCulture),
                ["name"] = user.Name,
                ["email"] = user.Email,
                // Only the platform role ("user" or "superAdmin"). The role inside each project is
                // read from the database on every request, so it never goes stale in a token.
                ["role"] = EnumNames.Of(user.PlatformRole)
            }
        };

        return (Handler.CreateToken(descriptor), expiresAt);
    }
}
