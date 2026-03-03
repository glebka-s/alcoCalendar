using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using AlcoCalendar.Api.Calendar;
using AlcoCalendar.Api.Users;
using AlcoCalendar.Application.Auth;
using AlcoCalendar.Application.Calendar;
using AlcoCalendar.Application.Users;
using AlcoCalendar.Infrastructure.Calendar;
using AlcoCalendar.Infrastructure.Persistence;
using AlcoCalendar.Infrastructure.Security;
using AlcoCalendar.Infrastructure.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Вставьте JWT токен. Пример: eyJhbGci...",
        });

        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    builder.Services.AddDbContext<AlcoDbContext>(options =>
    {
        var cs = builder.Configuration.GetConnectionString("DefaultConnection")
                 ?? builder.Configuration["ConnectionStrings:DefaultConnection"];
        if (string.IsNullOrWhiteSpace(cs))
            throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");

        options.UseNpgsql(cs);
    });

    builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
    builder.Services.AddScoped<ITokenService, JwtTokenService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();
    builder.Services.AddScoped<ICalendarService, CalendarService>();

    var jwtSection = builder.Configuration.GetSection("Jwt");
    var jwtOptions = jwtSection.Get<JwtOptions>() ?? new JwtOptions();
    var signingKey = (jwtOptions.SigningKey ?? string.Empty).Trim();
    if (signingKey.Length < 32)
        throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters.");

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtOptions.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(10),
            };
        });

    builder.Services.AddAuthorization();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("frontend", p =>
            p.WithOrigins("http://localhost:5173", "http://localhost:3000")
             .AllowAnyHeader()
             .AllowAnyMethod()
        );
    });

    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter("auth", o =>
        {
            o.PermitLimit = 10;
            o.Window = TimeSpan.FromMinutes(1);
            o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            o.QueueLimit = 0;
        });

        options.AddFixedWindowLimiter("calendar", o =>
        {
            o.PermitLimit = 60;
            o.Window = TimeSpan.FromMinutes(1);
            o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            o.QueueLimit = 0;
        });

        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    });

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AlcoDbContext>();
        db.Database.Migrate();
    }

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseSerilogRequestLogging(opts =>
    {
        opts.GetLevel = (ctx, elapsed, ex) =>
            ex is not null || ctx.Response.StatusCode >= 500
                ? LogEventLevel.Error
                : LogEventLevel.Information;
    });

    app.UseRateLimiter();
    app.UseCors("frontend");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapGet("/health", () => Results.Ok(new { status = "OK" }))
       .WithName("HealthCheck");

    app.MapAuthEndpoints();
    app.MapDrinkTypesEndpoints();
    app.MapCalendarEndpoints();
    app.MapUserEndpoints();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
