using AlcoCalendar.Domain.Calendar;
using Microsoft.EntityFrameworkCore;

namespace AlcoCalendar.Infrastructure.Persistence;

public sealed class AlcoDbContext : DbContext
{
    public DbSet<AlcoCalendar.Domain.Users.User> Users => Set<AlcoCalendar.Domain.Users.User>();
    public DbSet<AlcoCalendar.Domain.Users.RefreshToken> RefreshTokens => Set<AlcoCalendar.Domain.Users.RefreshToken>();
    public DbSet<AlcoCalendar.Domain.Drinks.DrinkType> DrinkTypes => Set<AlcoCalendar.Domain.Drinks.DrinkType>();
    public DbSet<DaySummary> DaySummaries => Set<DaySummary>();
    public DbSet<ConsumptionEvent> ConsumptionEvents => Set<ConsumptionEvent>();

    public AlcoDbContext(DbContextOptions<AlcoDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AlcoDbContext).Assembly);
}

