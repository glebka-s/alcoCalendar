using AlcoCalendar.Api.Auth;
using AlcoCalendar.Application.Auth;

namespace Microsoft.AspNetCore.Routing;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").RequireRateLimiting("auth");

        group.MapPost("/register", Register)
            .WithSummary("Регистрация нового пользователя")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/login", Login)
            .WithSummary("Вход в систему")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/refresh", Refresh)
            .WithSummary("Обновление токена доступа")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        return app;
    }

    private static async Task<IResult> Register(IAuthService auth, RegisterRequest req, CancellationToken ct)
    {
        try
        {
            var nowUtc = DateTime.UtcNow;
            var tokens = await auth.RegisterAsync(req.Email, req.Password, nowUtc, ct);
            return Results.Ok(new AuthResponse(tokens.AccessToken, tokens.RefreshToken, tokens.AccessTokenExpiresAtUtc, tokens.RefreshTokenExpiresAtUtc));
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> Login(IAuthService auth, LoginRequest req, CancellationToken ct)
    {
        try
        {
            var nowUtc = DateTime.UtcNow;
            var tokens = await auth.LoginAsync(req.Email, req.Password, nowUtc, ct);
            return Results.Ok(new AuthResponse(tokens.AccessToken, tokens.RefreshToken, tokens.AccessTokenExpiresAtUtc, tokens.RefreshTokenExpiresAtUtc));
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> Refresh(IAuthService auth, RefreshRequest req, CancellationToken ct)
    {
        try
        {
            var nowUtc = DateTime.UtcNow;
            var tokens = await auth.RefreshAsync(req.RefreshToken, nowUtc, ct);
            return Results.Ok(new AuthResponse(tokens.AccessToken, tokens.RefreshToken, tokens.AccessTokenExpiresAtUtc, tokens.RefreshTokenExpiresAtUtc));
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }
}

