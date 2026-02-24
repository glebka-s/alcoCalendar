namespace AlcoCalendar.Domain.Users;

public readonly record struct PasswordHash
{
    public string Value { get; }

    public PasswordHash(string value)
    {
        value = value?.Trim() ?? string.Empty;
        if (value.Length == 0) throw new ArgumentException("Password hash is required.", nameof(value));
        if (value.Length > 1024) throw new ArgumentException("Password hash is too long.", nameof(value));

        Value = value;
    }

    public override string ToString() => Value;
}

