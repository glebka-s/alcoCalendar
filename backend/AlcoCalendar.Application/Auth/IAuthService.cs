namespace AlcoCalendar.Application.Auth;

public interface IAuthService
{
    Task<AuthTokens> RegisterAsync(string email, string password, DateTime nowUtc, CancellationToken cancellationToken);
    Task<AuthTokens> LoginAsync(string email, string password, DateTime nowUtc, CancellationToken cancellationToken);
    Task<AuthTokens> RefreshAsync(string refreshToken, DateTime nowUtc, CancellationToken cancellationToken);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, DateTime nowUtc, CancellationToken cancellationToken);
    Task ChangeNameAsync(Guid userId, string name, DateTime nowUtc, CancellationToken cancellationToken);
}

