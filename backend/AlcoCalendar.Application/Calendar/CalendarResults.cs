using AlcoCalendar.Domain.Calendar;

namespace AlcoCalendar.Application.Calendar;

public sealed record DayCalendarItem(
    DateOnly Date,
    DayStatus Status,
    int TotalEvents,
    int TotalVolumeMl,
    IReadOnlyList<string> DrinkTypeNames);

public sealed record MonthCalendarResult(IReadOnlyList<DayCalendarItem> Days);

public sealed record ConsumptionEventItem(
    Guid Id,
    int DrinkTypeId,
    string DrinkTypeName,
    int VolumeMl,
    string? Notes,
    TimeOnly? Time);

public sealed record DayDetailsResult(
    DateOnly Date,
    DayStatus Status,
    IReadOnlyList<ConsumptionEventItem> Events);
