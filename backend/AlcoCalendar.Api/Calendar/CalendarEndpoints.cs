using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AlcoCalendar.Application.Calendar;
using AlcoCalendar.Domain.Calendar;
using Microsoft.AspNetCore.Mvc;

namespace AlcoCalendar.Api.Calendar;

public static class CalendarEndpoints
{
    public static IEndpointRouteBuilder MapCalendarEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/calendar")
            .RequireAuthorization()
            .RequireRateLimiting("calendar");

        group.MapGet("/{year:int}/{month:int}", GetMonthCalendar)
            .WithName("GetMonthCalendar")
            .WithSummary("Получить календарь за месяц")
            .Produces<MonthCalendarResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/day/{date}", GetDayDetails)
            .WithName("GetDayDetails")
            .WithSummary("Получить детали дня")
            .Produces<DayDetailsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/day/{date}", SetDayStatus)
            .WithName("SetDayStatus")
            .WithSummary("Установить статус дня (и опционально добавить событие)")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPatch("/day/{date}/events", AddConsumptionEvent)
            .WithName("AddConsumptionEvent")
            .WithSummary("Добавить событие потребления")
            .Produces<AddEventResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/day/{date}/events/{id:guid}", DeleteConsumptionEvent)
            .WithName("DeleteConsumptionEvent")
            .WithSummary("Удалить событие потребления")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/stats", GetStats)
            .WithName("GetCalendarStats")
            .WithSummary("Получить агрегированную статистику")
            .Produces<CalendarStatsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        return app;
    }

    // GET /calendar/{year}/{month}
    private static async Task<IResult> GetMonthCalendar(
        int year, int month,
        ICalendarService calendarService,
        HttpContext ctx,
        CancellationToken ct)
    {
        var userId = ExtractUserId(ctx);
        try
        {
            var result = await calendarService.GetMonthCalendarAsync(userId, year, month, ct);
            var days = result.Days.Select(d => new DayCalendarResponse(
                d.Date.ToString("yyyy-MM-dd"),
                d.Status.ToString(),
                d.TotalEvents,
                d.TotalVolumeMl,
                d.DrinkTypeNames)).ToList();

            return Results.Ok(new MonthCalendarResponse(days));
        }
        catch (CalendarValidationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    // GET /calendar/day/{date}
    private static async Task<IResult> GetDayDetails(
        string date,
        ICalendarService calendarService,
        HttpContext ctx,
        CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return Results.BadRequest(new { error = "Invalid date format. Use yyyy-MM-dd." });

        var userId = ExtractUserId(ctx);
        var result = await calendarService.GetDayDetailsAsync(userId, parsedDate, ct);

        var events = result.Events.Select(e => new ConsumptionEventResponse(
            e.Id, e.DrinkTypeId, e.DrinkTypeName, e.VolumeMl, e.Notes,
            e.Time?.ToString("HH:mm"))).ToList();

        return Results.Ok(new DayDetailsResponse(
            result.Date.ToString("yyyy-MM-dd"),
            result.Status.ToString(),
            events));
    }

    // POST /calendar/day/{date}
    private static async Task<IResult> SetDayStatus(
        string date,
        [FromBody] SetDayStatusRequest request,
        ICalendarService calendarService,
        HttpContext ctx,
        CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return Results.BadRequest(new { error = "Invalid date format. Use yyyy-MM-dd." });

        if (!Enum.TryParse<DayStatus>(request.Status, ignoreCase: true, out var status) || status == DayStatus.Unknown)
            return Results.BadRequest(new { error = "Status must be 'Sober' or 'Drank'." });

        if (status == DayStatus.Sober && request.Event is not null)
            return Results.BadRequest(new { error = "Cannot attach a consumption event when status is 'Sober'." });

        var userId = ExtractUserId(ctx);
        try
        {
            await calendarService.SetDayStatusAsync(userId, parsedDate, status, ct);

            if (request.Event is not null)
            {
                TimeOnly? time = ParseOptionalTime(request.Event.Time, out var timeError);
                if (timeError is not null)
                    return Results.BadRequest(new { error = timeError });

                await calendarService.AddConsumptionEventAsync(
                    userId, parsedDate,
                    request.Event.DrinkTypeId, request.Event.VolumeMl,
                    request.Event.Notes, time, ct);
            }

            return Results.Ok();
        }
        catch (CalendarValidationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    // PATCH /calendar/day/{date}/events
    private static async Task<IResult> AddConsumptionEvent(
        string date,
        [FromBody] AddEventRequest request,
        ICalendarService calendarService,
        HttpContext ctx,
        CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return Results.BadRequest(new { error = "Invalid date format. Use yyyy-MM-dd." });

        TimeOnly? time = ParseOptionalTime(request.Time, out var timeError);
        if (timeError is not null)
            return Results.BadRequest(new { error = timeError });

        var userId = ExtractUserId(ctx);
        try
        {
            var id = await calendarService.AddConsumptionEventAsync(
                userId, parsedDate, request.DrinkTypeId, request.VolumeMl, request.Notes, time, ct);

            return Results.Created($"/calendar/day/{date}/events/{id}", new AddEventResponse(id));
        }
        catch (CalendarValidationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    // DELETE /calendar/day/{date}/events/{id}
    private static async Task<IResult> DeleteConsumptionEvent(
        string date,
        Guid id,
        ICalendarService calendarService,
        HttpContext ctx,
        CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return Results.BadRequest(new { error = "Invalid date format. Use yyyy-MM-dd." });

        var userId = ExtractUserId(ctx);
        try
        {
            await calendarService.DeleteConsumptionEventAsync(userId, parsedDate, id, ct);
            return Results.NoContent();
        }
        catch (CalendarNotFoundException ex)
        {
            return Results.NotFound(new { error = ex.Message });
        }
    }

    // GET /calendar/stats?months=3
    private static async Task<IResult> GetStats(
        [FromQuery] int months,
        ICalendarService calendarService,
        HttpContext ctx,
        CancellationToken ct)
    {
        var userId = ExtractUserId(ctx);
        try
        {
            var result = await calendarService.GetStatsAsync(userId, months, ct);
            var weekly = result.WeeklyBreakdown.Select(w => new WeeklyBreakdownResponse(
                w.WeekStart.ToString("yyyy-MM-dd"), w.SoberDays, w.DrankDays, w.VolumeMl)).ToList();

            return Results.Ok(new CalendarStatsResponse(
                result.TotalDays, result.SoberDays, result.DrankDays, result.UnknownDays,
                result.SoberPercent, result.CurrentSoberStreak, result.LongestSoberStreak,
                result.TotalVolumeMl, result.FavoriteDrink, weekly));
        }
        catch (CalendarValidationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static Guid ExtractUserId(HttpContext ctx)
    {
        var sub = ctx.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? throw new InvalidOperationException("User ID not found in token.");
        return Guid.Parse(sub);
    }

    private static TimeOnly? ParseOptionalTime(string? raw, out string? error)
    {
        error = null;
        if (raw is null) return null;
        if (TimeOnly.TryParse(raw, out var t)) return t;
        error = "Invalid time format. Use HH:mm.";
        return null;
    }
}
