namespace AlcoCalendar.Domain.Calendar;

public sealed class DaySummary
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }
    public DayStatus Status { get; private set; }

    private DaySummary() { }

    public DaySummary(Guid userId, DateOnly date, DayStatus status)
    {
        UserId = userId;
        Date = date;
        Status = status;
    }

    public void SetStatus(DayStatus status) => Status = status;
}
