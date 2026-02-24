using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AlcoCalendar.Infrastructure.Persistence;

public sealed class AlcoDbContextFactory : IDesignTimeDbContextFactory<AlcoDbContext>
{
    public AlcoDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=alco_db;Username=alco_user;Password=alco_password";

        var optionsBuilder = new DbContextOptionsBuilder<AlcoDbContext>()
            .UseNpgsql(connectionString);

        return new AlcoDbContext(optionsBuilder.Options);
    }
}

