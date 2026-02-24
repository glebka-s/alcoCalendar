using AlcoCalendar.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AlcoCalendar.Infrastructure.Persistence.Config;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        var emailConverter = new ValueConverter<Email, string>(
            v => v.Value,
            v => new Email(v)
        );

        var passwordHashConverter = new ValueConverter<PasswordHash, string>(
            v => v.Value,
            v => new PasswordHash(v)
        );

        builder.ToTable("users");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Email)
            .HasConversion(emailConverter)
            .HasColumnName("email")
            .HasMaxLength(320)
            .IsRequired();

        builder.HasIndex(x => x.Email)
            .IsUnique();

        builder.Property(x => x.PasswordHash)
            .HasConversion(passwordHashConverter)
            .HasColumnName("password_hash")
            .HasMaxLength(1024)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc")
            .IsRequired();

        builder.HasMany(x => x.RefreshTokens)
            .WithOne()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

