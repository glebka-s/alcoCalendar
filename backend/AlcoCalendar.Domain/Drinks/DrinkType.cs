namespace AlcoCalendar.Domain.Drinks;

public sealed class DrinkType
{
    public int Id { get; private set; }
    public string Name { get; private set; } = null!;

    private DrinkType() { }

    public DrinkType(string name)
    {
        name = (name ?? string.Empty).Trim();
        if (name.Length == 0) throw new ArgumentException("Name is required.", nameof(name));
        if (name.Length > 100) throw new ArgumentException("Name is too long.", nameof(name));

        Name = name;
    }
}

