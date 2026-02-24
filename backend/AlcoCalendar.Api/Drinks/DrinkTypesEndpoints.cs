using AlcoCalendar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Microsoft.AspNetCore.Routing;

public static class DrinkTypesEndpoints
{
    public static IEndpointRouteBuilder MapDrinkTypesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/drink-types", async (AlcoDbContext db, CancellationToken ct) =>
        {
            var items = await db.DrinkTypes
                .OrderBy(x => x.Id)
                .Select(x => new { x.Id, x.Name })
                .ToListAsync(ct);

            return Results.Ok(items);
        });

        return app;
    }
}

