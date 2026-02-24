namespace AlcoCalendar.Application.Auth;

public interface IAuthService
{
    Task<AuthTokens> RegisterAsync(string email, string password, DateTime nowUtc, CancellationToken cancellationToken);
    Task<AuthTokens> LoginAsync(string email, string password, DateTime nowUtc, CancellationToken cancellationToken);
    Task<AuthTokens> RefreshAsync(string refreshToken, DateTime nowUtc, CancellationToken cancellationToken);
}

