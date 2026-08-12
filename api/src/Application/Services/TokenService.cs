using System.Globalization;
using System.Text;
using Domain;
using Domain.Entities;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

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
                // Same spelling as the role in every JSON response, and the same string the
                // policies in Program.cs compare against.
                ["role"] = RoleNames.Of(user.Role)
            }
        };

        return (Handler.CreateToken(descriptor), expiresAt);
    }
}
