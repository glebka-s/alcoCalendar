using AlcoCalendar.Domain.Calendar;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlcoCalendar.Infrastructure.Persistence.Config;

public sealed class ConsumptionEventConfiguration : IEntityTypeConfiguration<ConsumptionEvent>
{
    public void Configure(EntityTypeBuilder<ConsumptionEvent> builder)
    {
        builder.ToTable("consumption_events");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(x => x.Date)
            .HasColumnName("date")
            .IsRequired();

        builder.Property(x => x.DrinkTypeId)
            .HasColumnName("drink_type_id")
            .IsRequired();

        builder.Property(x => x.VolumeMl)
            .HasColumnName("volume_ml")
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(500);

        builder.Property(x => x.Time)
            .HasColumnName("time");

        builder.HasIndex(x => new { x.UserId, x.Date });
    }
}
