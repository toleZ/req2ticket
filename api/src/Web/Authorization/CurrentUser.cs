namespace Web.Authorization;

/* Who is calling, read from the token. Replaces the CurrentUserId() helper each controller used to
   carry. Services never see this class: they receive the id as a parameter, because "who is logged
   in" is an HTTP fact and Application has no HttpContext — and so the seeder can call them too. */
public class CurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // "sub" arrives spelled like that because Program.cs turns off inbound claim mapping. Every
    // endpoint that uses this requires a token (the fallback policy), so a missing claim would be a
    // token we did not sign.
    public int Id
    {
        get
        {
            string? sub = _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value;
            return int.TryParse(sub, out int id)
                ? id
                : throw new UnauthorizedAccessException("The session is not valid. Sign in again.");
        }
    }
}
