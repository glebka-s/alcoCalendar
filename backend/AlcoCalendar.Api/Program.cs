var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// For containerized environment HTTP is usually enough; HTTPS is handled by reverse proxy if needed.
// app.UseHttpsRedirection();

app.MapGet("/health", () => Results.Ok(new { status = "OK" }))
   .WithName("HealthCheck");

app.Run();
