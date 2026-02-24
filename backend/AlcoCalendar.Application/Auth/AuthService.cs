using AlcoCalendar.Application.Users;
using AlcoCalendar.Domain.Users;

namespace AlcoCalendar.Application.Auth;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository users, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthTokens> RegisterAsync(string email, string password, DateTime nowUtc, CancellationToken cancellationToken)
    {
        var emailVo = new Email(email);
        var existing = await _users.FindByEmailAsync(emailVo, cancellationToken);
        if (existing is not null)
            throw new InvalidOperationException("User already exists.");

        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters long.", nameof(password));

        var user = new User(emailVo, new PasswordHash(_passwordHasher.Hash(password)), nowUtc);

        var tokens = _tokenService.IssueTokens(user, nowUtc);
        user.AddRefreshToken(new RefreshToken(
            user.Id,
            _tokenService.HashRefreshToken(tokens.RefreshToken),
            nowUtc,
            tokens.RefreshTokenExpiresAtUtc
        ));

        await _users.AddAsync(user, cancellationToken);
        await _users.SaveChangesAsync(cancellationToken);

        return tokens;
    }

    public async Task<AuthTokens> LoginAsync(string email, string password, DateTime nowUtc, CancellationToken cancellationToken)
    {
        var emailVo = new Email(email);
        var user = await _users.FindByEmailAsync(emailVo, cancellationToken);
        if (user is null)
            throw new InvalidOperationException("Invalid credentials.");

        if (!_passwordHasher.Verify(password, user.PasswordHash.Value))
            throw new InvalidOperationException("Invalid credentials.");

        var tokens = _tokenService.IssueTokens(user, nowUtc);
        var refreshToken = new RefreshToken(
            user.Id,
            _tokenService.HashRefreshToken(tokens.RefreshToken),
            nowUtc,
            tokens.RefreshTokenExpiresAtUtc
        );
        user.AddRefreshToken(refreshToken);
        _users.TrackNewRefreshToken(refreshToken);

        await _users.SaveChangesAsync(cancellationToken);
        return tokens;
    }

    public async Task<AuthTokens> RefreshAsync(string refreshToken, DateTime nowUtc, CancellationToken cancellationToken)
    {
        refreshToken = refreshToken?.Trim() ?? string.Empty;
        if (refreshToken.Length == 0)
            throw new ArgumentException("Refresh token is required.", nameof(refreshToken));

        var tokenHash = _tokenService.HashRefreshToken(refreshToken);

        var user = await _users.FindByRefreshTokenHashAsync(tokenHash, cancellationToken);
        if (user is null)
            throw new InvalidOperationException("Invalid refresh token.");

        var storedToken = user.RefreshTokens.FirstOrDefault(rt => rt.TokenHash == tokenHash);
        if (storedToken is null || !storedToken.IsActive(nowUtc))
            throw new InvalidOperationException("Invalid refresh token.");

        storedToken.Revoke(nowUtc);

        var tokens = _tokenService.IssueTokens(user, nowUtc);
        var newRefreshToken = new RefreshToken(
            user.Id,
            _tokenService.HashRefreshToken(tokens.RefreshToken),
            nowUtc,
            tokens.RefreshTokenExpiresAtUtc
        );
        user.AddRefreshToken(newRefreshToken);
        _users.TrackNewRefreshToken(newRefreshToken);

        await _users.SaveChangesAsync(cancellationToken);
        return tokens;
    }
}

