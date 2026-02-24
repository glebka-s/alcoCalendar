using AlcoCalendar.Domain.Calendar;

namespace AlcoCalendar.Application.Calendar;

public interface ICalendarService
{
    Task<MonthCalendarResult> GetMonthCalendarAsync(Guid userId, int year, int month, CancellationToken ct = default);
    Task<DayDetailsResult> GetDayDetailsAsync(Guid userId, DateOnly date, CancellationToken ct = default);
    Task SetDayStatusAsync(Guid userId, DateOnly date, DayStatus status, CancellationToken ct = default);
    Task<Guid> AddConsumptionEventAsync(Guid userId, DateOnly date, int drinkTypeId, int volumeMl, string? notes, TimeOnly? time, CancellationToken ct = default);
    Task DeleteConsumptionEventAsync(Guid userId, DateOnly date, Guid eventId, CancellationToken ct = default);
}
