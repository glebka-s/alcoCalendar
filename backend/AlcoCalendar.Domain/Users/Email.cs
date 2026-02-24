namespace AlcoCalendar.Domain.Users;

public readonly record struct Email
{
    public string Value { get; }

    public Email(string value)
    {
        value = (value ?? string.Empty).Trim();
        if (value.Length == 0) throw new ArgumentException("Email is required.", nameof(value));
        if (value.Length > 320) throw new ArgumentException("Email is too long.", nameof(value));
        if (!value.Contains('@')) throw new ArgumentException("Email is invalid.", nameof(value));

        Value = value.ToLowerInvariant();
    }

    public override string ToString() => Value;
}

