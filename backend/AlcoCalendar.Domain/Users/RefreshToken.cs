namespace AlcoCalendar.Domain.Users;

public sealed class RefreshToken
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }

    public string TokenHash { get; private set; } = null!;

    public DateTime CreatedAtUtc { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime? RevokedAtUtc { get; private set; }

    private RefreshToken() { }

    public RefreshToken(Guid userId, string tokenHash, DateTime createdAtUtc, DateTime expiresAtUtc)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
        tokenHash = tokenHash?.Trim() ?? string.Empty;
        if (tokenHash.Length == 0) throw new ArgumentException("TokenHash is required.", nameof(tokenHash));

        UserId = userId;
        TokenHash = tokenHash;
        CreatedAtUtc = createdAtUtc;
        ExpiresAtUtc = expiresAtUtc;
    }

    public bool IsActive(DateTime nowUtc) => RevokedAtUtc is null && ExpiresAtUtc > nowUtc;

    public void Revoke(DateTime revokedAtUtc)
    {
        if (RevokedAtUtc is not null) return;
        RevokedAtUtc = revokedAtUtc;
    }
}

