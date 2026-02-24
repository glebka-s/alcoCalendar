using AlcoCalendar.Application.Calendar;
using AlcoCalendar.Domain.Calendar;
using AlcoCalendar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AlcoCalendar.Infrastructure.Calendar;

public sealed class CalendarRepository : ICalendarRepository
{
    private readonly AlcoDbContext _db;

    public CalendarRepository(AlcoDbContext db)
    {
        _db = db;
    }

    public Task<DaySummary?> GetDaySummaryAsync(Guid userId, DateOnly date, CancellationToken ct = default) =>
        _db.DaySummaries.FirstOrDefaultAsync(s => s.UserId == userId && s.Date == date, ct);

    public Task<List<DaySummary>> GetMonthSummariesAsync(Guid userId, int year, int month, CancellationToken ct = default)
    {
        var start = new DateOnly(year, month, 1);
        var end = new DateOnly(year, month, DateTime.DaysInMonth(year, month));
        return _db.DaySummaries
            .Where(s => s.UserId == userId && s.Date >= start && s.Date <= end)
            .ToListAsync(ct);
    }

    public Task<List<ConsumptionEvent>> GetDayEventsAsync(Guid userId, DateOnly date, CancellationToken ct = default) =>
        _db.ConsumptionEvents
            .Where(e => e.UserId == userId && e.Date == date)
            .OrderBy(e => e.Time)
            .ToListAsync(ct);

    public Task<List<ConsumptionEvent>> GetMonthEventsAsync(Guid userId, int year, int month, CancellationToken ct = default)
    {
        var start = new DateOnly(year, month, 1);
        var end = new DateOnly(year, month, DateTime.DaysInMonth(year, month));
        return _db.ConsumptionEvents
            .Where(e => e.UserId == userId && e.Date >= start && e.Date <= end)
            .ToListAsync(ct);
    }

    public Task<ConsumptionEvent?> GetEventByIdAsync(Guid userId, Guid eventId, CancellationToken ct = default) =>
        _db.ConsumptionEvents.FirstOrDefaultAsync(e => e.UserId == userId && e.Id == eventId, ct);

    public async Task UpsertDaySummaryAsync(DaySummary summary, CancellationToken ct = default)
    {
        if (_db.Entry(summary).State == EntityState.Detached)
            _db.DaySummaries.Add(summary);

        await _db.SaveChangesAsync(ct);
    }

    public async Task AddConsumptionEventAsync(ConsumptionEvent evt, CancellationToken ct = default)
    {
        _db.ConsumptionEvents.Add(evt);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteConsumptionEventAsync(ConsumptionEvent evt, CancellationToken ct = default)
    {
        _db.ConsumptionEvents.Remove(evt);
        await _db.SaveChangesAsync(ct);
    }

    public Task<bool> DrinkTypeExistsAsync(int drinkTypeId, CancellationToken ct = default) =>
        _db.DrinkTypes.AnyAsync(d => d.Id == drinkTypeId, ct);

    public async Task<Dictionary<int, string>> GetDrinkTypeNamesAsync(CancellationToken ct = default) =>
        await _db.DrinkTypes.ToDictionaryAsync(d => d.Id, d => d.Name, ct);
}
