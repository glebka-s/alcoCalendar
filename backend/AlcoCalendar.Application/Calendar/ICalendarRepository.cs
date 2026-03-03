using AlcoCalendar.Domain.Calendar;

namespace AlcoCalendar.Application.Calendar;

public interface ICalendarRepository
{
    Task<DaySummary?> GetDaySummaryAsync(Guid userId, DateOnly date, CancellationToken ct = default);
    Task<List<DaySummary>> GetMonthSummariesAsync(Guid userId, int year, int month, CancellationToken ct = default);
    Task<List<ConsumptionEvent>> GetDayEventsAsync(Guid userId, DateOnly date, CancellationToken ct = default);
    Task<List<ConsumptionEvent>> GetMonthEventsAsync(Guid userId, int year, int month, CancellationToken ct = default);
    Task<ConsumptionEvent?> GetEventByIdAsync(Guid userId, Guid eventId, CancellationToken ct = default);
    Task UpsertDaySummaryAsync(DaySummary summary, CancellationToken ct = default);
    Task AddConsumptionEventAsync(ConsumptionEvent evt, CancellationToken ct = default);
    Task DeleteConsumptionEventAsync(ConsumptionEvent evt, CancellationToken ct = default);
    Task<bool> DrinkTypeExistsAsync(int drinkTypeId, CancellationToken ct = default);
    Task<Dictionary<int, string>> GetDrinkTypeNamesAsync(CancellationToken ct = default);
    Task<List<DaySummary>> GetSummariesInRangeAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<List<ConsumptionEvent>> GetEventsInRangeAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default);
}
