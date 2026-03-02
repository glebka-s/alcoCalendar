using AlcoCalendar.Domain.Calendar;

namespace AlcoCalendar.Application.Calendar;

public sealed class CalendarService : ICalendarService
{
    private readonly ICalendarRepository _repo;

    public CalendarService(ICalendarRepository repo)
    {
        _repo = repo;
    }

    public async Task<MonthCalendarResult> GetMonthCalendarAsync(Guid userId, int year, int month, CancellationToken ct = default)
    {
        ValidateYearMonth(year, month);

        var summaries = await _repo.GetMonthSummariesAsync(userId, year, month, ct);
        var events = await _repo.GetMonthEventsAsync(userId, year, month, ct);
        var drinkTypeNames = await _repo.GetDrinkTypeNamesAsync(ct);

        var summaryMap = summaries.ToDictionary(s => s.Date);
        var eventsByDate = events.GroupBy(e => e.Date).ToDictionary(g => g.Key, g => g.ToList());

        var daysInMonth = DateTime.DaysInMonth(year, month);
        var days = new List<DayCalendarItem>(daysInMonth);

        for (var day = 1; day <= daysInMonth; day++)
        {
            var date = new DateOnly(year, month, day);
            summaryMap.TryGetValue(date, out var summary);
            eventsByDate.TryGetValue(date, out var dayEvents);
            dayEvents ??= [];

            var status = summary?.Status ?? DayStatus.Unknown;
            List<ConsumptionEvent> visibleEvents = status == DayStatus.Drank
                ? dayEvents
                : [];

            var drinkNames = visibleEvents
                .Select(e => drinkTypeNames.TryGetValue(e.DrinkTypeId, out var n) ? n : "Unknown")
                .Distinct()
                .ToList();

            days.Add(new DayCalendarItem(
                date,
                status,
                visibleEvents.Count,
                visibleEvents.Sum(e => e.VolumeMl),
                drinkNames));
        }

        return new MonthCalendarResult(days);
    }

    public async Task<DayDetailsResult> GetDayDetailsAsync(Guid userId, DateOnly date, CancellationToken ct = default)
    {
        var summary = await _repo.GetDaySummaryAsync(userId, date, ct);
        var events = await _repo.GetDayEventsAsync(userId, date, ct);
        var drinkTypeNames = await _repo.GetDrinkTypeNamesAsync(ct);

        var eventItems = events.Select(e => new ConsumptionEventItem(
            e.Id,
            e.DrinkTypeId,
            drinkTypeNames.TryGetValue(e.DrinkTypeId, out var n) ? n : "Unknown",
            e.VolumeMl,
            e.Notes,
            e.Time)).ToList();

        return new DayDetailsResult(date, summary?.Status ?? DayStatus.Unknown, eventItems);
    }

    public async Task SetDayStatusAsync(Guid userId, DateOnly date, DayStatus status, CancellationToken ct = default)
    {
        if (date > DateOnly.FromDateTime(DateTime.UtcNow))
            throw new CalendarValidationException("Cannot set status for a future date.");

        var summary = await _repo.GetDaySummaryAsync(userId, date, ct);
        if (summary is null)
            summary = new DaySummary(userId, date, status);
        else
            summary.SetStatus(status);

        await _repo.UpsertDaySummaryAsync(summary, ct);
    }

    public async Task<Guid> AddConsumptionEventAsync(
        Guid userId, DateOnly date, int drinkTypeId, int volumeMl,
        string? notes, TimeOnly? time, CancellationToken ct = default)
    {
        if (date > DateOnly.FromDateTime(DateTime.UtcNow))
            throw new CalendarValidationException("Cannot add events for a future date.");

        if (volumeMl <= 0)
            throw new CalendarValidationException("Volume must be greater than 0.");

        if (!await _repo.DrinkTypeExistsAsync(drinkTypeId, ct))
            throw new CalendarValidationException($"Drink type with id={drinkTypeId} does not exist.");

        var evt = new ConsumptionEvent(userId, date, drinkTypeId, volumeMl, notes, time);
        await _repo.AddConsumptionEventAsync(evt, ct);

        var summary = await _repo.GetDaySummaryAsync(userId, date, ct);
        if (summary is null)
            await _repo.UpsertDaySummaryAsync(new DaySummary(userId, date, DayStatus.Drank), ct);
        else if (summary.Status != DayStatus.Drank)
        {
            summary.SetStatus(DayStatus.Drank);
            await _repo.UpsertDaySummaryAsync(summary, ct);
        }

        return evt.Id;
    }

    public async Task DeleteConsumptionEventAsync(Guid userId, DateOnly date, Guid eventId, CancellationToken ct = default)
    {
        var evt = await _repo.GetEventByIdAsync(userId, eventId, ct);
        if (evt is null)
            throw new CalendarNotFoundException($"Event {eventId} not found.");

        await _repo.DeleteConsumptionEventAsync(evt, ct);
    }

    private static void ValidateYearMonth(int year, int month)
    {
        if (year < 2000 || year > 2100)
            throw new CalendarValidationException("Year must be between 2000 and 2100.");
        if (month < 1 || month > 12)
            throw new CalendarValidationException("Month must be between 1 and 12.");
    }
}
