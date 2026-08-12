namespace Web.DTOs;

// ExpiresAt travels so the front end can tell an expired session from a rejected one
// without decoding the token. It is UTC, like everything the API returns.
public record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);
