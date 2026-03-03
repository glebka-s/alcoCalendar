namespace AlcoCalendar.Domain.Users;

public sealed class User
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Email Email { get; private set; }
    public PasswordHash PasswordHash { get; private set; }
    public string? Name { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    public List<RefreshToken> RefreshTokens { get; private set; } = new();

    private User() { }

    public User(Email email, PasswordHash passwordHash, DateTime createdAtUtc)
    {
        Email = email;
        PasswordHash = passwordHash;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = createdAtUtc;
    }

    public void AddRefreshToken(RefreshToken token) => RefreshTokens.Add(token);

    public void SetPasswordHash(PasswordHash passwordHash, DateTime nowUtc)
    {
        PasswordHash = passwordHash;
        UpdatedAtUtc = nowUtc;
    }

    public void SetName(string name, DateTime nowUtc)
    {
        Name = name.Trim().Length > 100 ? name.Trim()[..100] : name.Trim();
        UpdatedAtUtc = nowUtc;
    }

    public void Touch(DateTime nowUtc) => UpdatedAtUtc = nowUtc;
}

