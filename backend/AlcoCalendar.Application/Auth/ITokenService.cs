using AlcoCalendar.Domain.Users;

namespace AlcoCalendar.Application.Auth;

public interface ITokenService
{
    AuthTokens IssueTokens(User user, DateTime nowUtc);
    string HashRefreshToken(string refreshToken);
}

