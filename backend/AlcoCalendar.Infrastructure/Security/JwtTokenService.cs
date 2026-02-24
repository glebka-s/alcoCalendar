using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AlcoCalendar.Application.Auth;
using AlcoCalendar.Domain.Users;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AlcoCalendar.Infrastructure.Security;

public sealed class JwtTokenService : ITokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options) => _options = options.Value;

    public AuthTokens IssueTokens(User user, DateTime nowUtc)
    {
        if (string.IsNullOrWhiteSpace(_options.SigningKey) || _options.SigningKey.Trim().Length < 32)
            throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters.");

        var accessExpiresAtUtc = nowUtc.AddMinutes(_options.AccessTokenLifetimeMinutes);

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey.Trim()));
        var signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString("D")),
            new(JwtRegisteredClaimNames.Email, user.Email.Value),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("D")),
            new(JwtRegisteredClaimNames.Iat, ToUnixSecondsString(nowUtc), ClaimValueTypes.Integer64),
        };

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: nowUtc,
            expires: accessExpiresAtUtc,
            signingCredentials: signingCredentials
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        var refreshTokenExpiresAtUtc = nowUtc.AddDays(_options.RefreshTokenLifetimeDays);
        var refreshToken = GenerateRefreshToken();

        return new AuthTokens(accessToken, accessExpiresAtUtc, refreshToken, refreshTokenExpiresAtUtc);
    }

    public string HashRefreshToken(string refreshToken)
    {
        refreshToken = refreshToken?.Trim() ?? string.Empty;
        if (refreshToken.Length == 0) throw new ArgumentException("Refresh token is required.", nameof(refreshToken));

        if (string.IsNullOrWhiteSpace(_options.SigningKey))
            throw new InvalidOperationException("Jwt:SigningKey is required to hash refresh tokens.");

        var keyBytes = Encoding.UTF8.GetBytes(_options.SigningKey.Trim());
        var dataBytes = Encoding.UTF8.GetBytes(refreshToken);

        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GenerateRefreshToken()
    {
        Span<byte> bytes = stackalloc byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Base64UrlEncode(bytes);
    }

    private static string Base64UrlEncode(ReadOnlySpan<byte> bytes)
    {
        var base64 = Convert.ToBase64String(bytes);
        return base64.TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string ToUnixSecondsString(DateTime utc)
    {
        var unix = new DateTimeOffset(utc, TimeSpan.Zero).ToUnixTimeSeconds();
        return unix.ToString(CultureInfo.InvariantCulture);
    }
}

