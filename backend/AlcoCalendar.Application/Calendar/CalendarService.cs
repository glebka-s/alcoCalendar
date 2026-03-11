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
        if (date >= DateOnly.FromDateTime(DateTime.UtcNow))
            throw new CalendarValidationException("Cannot set status for today or a future date.");

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
        if (date >= DateOnly.FromDateTime(DateTime.UtcNow))
            throw new CalendarValidationException("Cannot add events for today or a future date.");

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

    public async Task<CalendarStatsResult> GetStatsAsync(Guid userId, int months, CancellationToken ct = default)
    {
        if (months < 1 || months > 12)
            throw new CalendarValidationException("Months must be between 1 and 12.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var from = today.AddMonths(-months).AddDays(1);
        var totalDays = today.DayNumber - from.DayNumber + 1;

        var summaries = await _repo.GetSummariesInRangeAsync(userId, from, today, ct);
        var events = await _repo.GetEventsInRangeAsync(userId, from, today, ct);
        var allSummaries = await _repo.GetAllSummariesAsync(userId, ct);
        var allEvents = await _repo.GetAllEventsAsync(userId, ct);
        var drinkTypeNames = await _repo.GetDrinkTypeNamesAsync(ct);

        var summaryByDate = summaries.ToDictionary(s => s.Date);

        var soberDays = summaries.Count(s => s.Status == DayStatus.Sober);
        var drankDays = summaries.Count(s => s.Status == DayStatus.Drank);
        var unknownDays = totalDays - soberDays - drankDays;
        var soberPercent = totalDays > 0 ? Math.Round((double)soberDays / totalDays * 100, 1) : 0;

        var totalVolumeMl = events.Sum(e => e.VolumeMl);

        // Favorite drink — drink type that appeared on the most days with status "Drank" (all-time)
        string? favoriteDrink = null;
        if (allEvents.Count > 0)
        {
            var drankDates = allSummaries
                .Where(s => s.Status == DayStatus.Drank)
                .Select(s => s.Date)
                .ToHashSet();

            var eventsOnDrankDays = allEvents.Where(e => drankDates.Contains(e.Date)).ToList();
            if (eventsOnDrankDays.Count > 0)
            {
                var topDrinkId = eventsOnDrankDays
                    .GroupBy(e => e.DrinkTypeId)
                    .OrderByDescending(g => g.Select(e => e.Date).Distinct().Count())
                    .First().Key;
                drinkTypeNames.TryGetValue(topDrinkId, out favoriteDrink);
            }
        }

        // Sober streak (current and longest) — within the requested window
        int currentStreak = 0, longestStreak = 0, streak = 0;
        for (var d = from; d <= today; d = d.AddDays(1))
        {
            if (summaryByDate.TryGetValue(d, out var s) && s.Status == DayStatus.Sober)
            {
                streak++;
                if (streak > longestStreak) longestStreak = streak;
            }
            else
            {
                streak = 0;
            }
        }
        currentStreak = streak;

        // Longest drinking streak — all-time
        var allSummaryByDate = allSummaries.ToDictionary(s => s.Date);
        int longestDrinkingStreak = 0, drinkStreak = 0;
        if (allSummaries.Count > 0)
        {
            var minDate = allSummaries.Min(s => s.Date);
            for (var d = minDate; d <= today; d = d.AddDays(1))
            {
                if (allSummaryByDate.TryGetValue(d, out var ds) && ds.Status == DayStatus.Drank)
                {
                    drinkStreak++;
                    if (drinkStreak > longestDrinkingStreak) longestDrinkingStreak = drinkStreak;
                }
                else
                {
                    drinkStreak = 0;
                }
            }
        }

        // Weekly breakdown
        var weeks = new List<WeeklyBreakdownItem>();
        var weekStart = from;
        var dowOffset = ((int)from.DayOfWeek + 6) % 7;
        if (dowOffset > 0)
            weekStart = from.AddDays(-dowOffset);

        for (var ws = weekStart; ws <= today; ws = ws.AddDays(7))
        {
            var we = ws.AddDays(6);
            if (we > today) we = today;
            var effectiveStart = ws < from ? from : ws;

            int wSober = 0, wDrank = 0, wVol = 0;
            for (var d = effectiveStart; d <= we; d = d.AddDays(1))
            {
                if (summaryByDate.TryGetValue(d, out var ds))
                {
                    if (ds.Status == DayStatus.Sober) wSober++;
                    else if (ds.Status == DayStatus.Drank) wDrank++;
                }
            }
            wVol = events.Where(e => e.Date >= effectiveStart && e.Date <= we).Sum(e => e.VolumeMl);
            weeks.Add(new WeeklyBreakdownItem(ws, wSober, wDrank, wVol));
        }

        return new CalendarStatsResult(
            totalDays, soberDays, drankDays, unknownDays, soberPercent,
            currentStreak, longestStreak, longestDrinkingStreak, totalVolumeMl, favoriteDrink, weeks);
    }

    private static void ValidateYearMonth(int year, int month)
    {
        if (year < 2000 || year > 2100)
            throw new CalendarValidationException("Year must be between 2000 and 2100.");
        if (month < 1 || month > 12)
            throw new CalendarValidationException("Month must be between 1 and 12.");
    }
}
