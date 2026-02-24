var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// For containerized environment HTTP is usually enough; HTTPS is handled by reverse proxy if needed.
// app.UseHttpsRedirection();

app.MapGet("/health", () => Results.Ok(new { status = "OK" }))
   .WithName("HealthCheck");

app.Run();
