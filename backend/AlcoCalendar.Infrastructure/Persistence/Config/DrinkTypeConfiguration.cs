using AlcoCalendar.Domain.Drinks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlcoCalendar.Infrastructure.Persistence.Config;

public sealed class DrinkTypeConfiguration : IEntityTypeConfiguration<DrinkType>
{
    public void Configure(EntityTypeBuilder<DrinkType> builder)
    {
        builder.ToTable("drink_types");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(x => x.Name)
            .IsUnique();

        builder.HasData(
            new { Id = 1, Name = "Пиво" },
            new { Id = 2, Name = "Вино" },
            new { Id = 3, Name = "Крепкий алкоголь" },
            new { Id = 4, Name = "Сидр" },
            new { Id = 5, Name = "Коктейль" }
        );
    }
}

