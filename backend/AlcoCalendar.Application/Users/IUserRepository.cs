using AlcoCalendar.Domain.Users;

namespace AlcoCalendar.Application.Users;

public interface IUserRepository
{
    Task<User?> FindByEmailAsync(Email email, CancellationToken cancellationToken);
    Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<User?> FindByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken cancellationToken);
    Task AddAsync(User user, CancellationToken cancellationToken);
    void TrackNewRefreshToken(RefreshToken token);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}

