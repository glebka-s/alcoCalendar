using AlcoCalendar.Domain.Calendar;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlcoCalendar.Infrastructure.Persistence.Config;

public sealed class DaySummaryConfiguration : IEntityTypeConfiguration<DaySummary>
{
    public void Configure(EntityTypeBuilder<DaySummary> builder)
    {
        builder.ToTable("day_summaries");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(x => x.Date)
            .HasColumnName("date")
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.HasIndex(x => new { x.UserId, x.Date })
            .IsUnique();
    }
}
