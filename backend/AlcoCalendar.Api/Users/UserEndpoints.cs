using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AlcoCalendar.Application.Auth;
using AlcoCalendar.Application.Users;

namespace AlcoCalendar.Api.Users;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/me").RequireAuthorization();

        group.MapGet("/", GetProfile)
            .WithName("GetProfile")
            .WithSummary("Получить профиль пользователя");

        group.MapPatch("/name", ChangeName)
            .WithName("ChangeName")
            .WithSummary("Изменить имя пользователя");

        group.MapPatch("/password", ChangePassword)
            .WithName("ChangePassword")
            .WithSummary("Изменить пароль");

        return app;
    }

    private static async Task<IResult> GetProfile(
        IUserRepository users,
        HttpContext ctx,
        CancellationToken ct)
    {
        var userId = ExtractUserId(ctx);
        var user = await users.FindByIdAsync(userId, ct);
        if (user is null) return Results.NotFound();

        return Results.Ok(new ProfileResponse(userId.ToString(), user.Email.Value, user.Name, user.CreatedAtUtc));
    }

    private static async Task<IResult> ChangeName(
        ChangeNameRequest request,
        IAuthService auth,
        HttpContext ctx,
        CancellationToken ct)
    {
        var userId = ExtractUserId(ctx);
        try
        {
            await auth.ChangeNameAsync(userId, request.Name, DateTime.UtcNow, ct);
            return Results.Ok();
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> ChangePassword(
        ChangePasswordRequest request,
        IAuthService auth,
        HttpContext ctx,
        CancellationToken ct)
    {
        var userId = ExtractUserId(ctx);
        try
        {
            await auth.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword, DateTime.UtcNow, ct);
            return Results.Ok();
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
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
}

public sealed record ProfileResponse(string UserId, string Email, string? Name, DateTime CreatedAtUtc);
public sealed record ChangeNameRequest([Required] string Name);
public sealed record ChangePasswordRequest([Required] string CurrentPassword, [Required] string NewPassword);
