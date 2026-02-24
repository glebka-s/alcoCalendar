using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace AlcoCalendar.Api.Calendar;

// ── Requests ──────────────────────────────────────────────────────────────────

/// <summary>Запрос на установку статуса дня.</summary>
public sealed record SetDayStatusRequest(
    /// <summary>Статус дня: "Sober" или "Drank".</summary>
    [Required] string Status,
    /// <summary>Опциональное первичное событие (только для статуса "Drank").</summary>
    AddEventRequest? Event = null);

/// <summary>Событие потребления алкоголя.</summary>
public sealed record AddEventRequest(
    /// <summary>ID типа напитка (1–5, см. GET /drink-types).</summary>
    [Required, DefaultValue(1)] int DrinkTypeId,
    /// <summary>Объём в мл, больше 0.</summary>
    [Required, DefaultValue(500)] int VolumeMl,
    /// <summary>Заметка (опционально).</summary>
    string? Notes = null,
    /// <summary>Время в формате HH:mm (опционально).</summary>
    [DefaultValue("20:30")] string? Time = null);

// ── Responses ─────────────────────────────────────────────────────────────────

public sealed record DayCalendarResponse(
    string Date,
    string Status,
    int TotalEvents,
    int TotalVolumeMl,
    IReadOnlyList<string> DrinkTypeNames);

public sealed record MonthCalendarResponse(IReadOnlyList<DayCalendarResponse> Days);

public sealed record ConsumptionEventResponse(
    Guid Id,
    int DrinkTypeId,
    string DrinkTypeName,
    int VolumeMl,
    string? Notes,
    string? Time);

public sealed record DayDetailsResponse(
    string Date,
    string Status,
    IReadOnlyList<ConsumptionEventResponse> Events);

public sealed record AddEventResponse(Guid Id);
