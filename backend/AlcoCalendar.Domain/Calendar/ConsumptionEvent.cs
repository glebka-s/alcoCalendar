namespace AlcoCalendar.Domain.Calendar;

public sealed class ConsumptionEvent
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }
    public int DrinkTypeId { get; private set; }
    public int VolumeMl { get; private set; }
    public string? Notes { get; private set; }
    public TimeOnly? Time { get; private set; }

    private ConsumptionEvent() { }

    public ConsumptionEvent(Guid userId, DateOnly date, int drinkTypeId, int volumeMl, string? notes, TimeOnly? time)
    {
        UserId = userId;
        Date = date;
        DrinkTypeId = drinkTypeId;
        VolumeMl = volumeMl;
        Notes = notes?.Trim();
        Time = time;
    }
}
