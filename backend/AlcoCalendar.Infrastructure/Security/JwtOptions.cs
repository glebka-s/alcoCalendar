namespace AlcoCalendar.Infrastructure.Security;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "AlcoCalendar";
    public string Audience { get; set; } = "AlcoCalendar";
    public string SigningKey { get; set; } = string.Empty;

    public int AccessTokenLifetimeMinutes { get; set; } = 15;
    public int RefreshTokenLifetimeDays { get; set; } = 30;
}

