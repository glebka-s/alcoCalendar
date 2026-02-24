using AlcoCalendar.Application.Users;
using AlcoCalendar.Domain.Users;
using AlcoCalendar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AlcoCalendar.Infrastructure.Users;

public sealed class UserRepository : IUserRepository
{
    private readonly AlcoDbContext _db;

    public UserRepository(AlcoDbContext db) => _db = db;

    public Task<User?> FindByEmailAsync(Email email, CancellationToken cancellationToken) =>
        _db.Users
            .Include(x => x.RefreshTokens)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    public Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _db.Users
            .Include(x => x.RefreshTokens)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<User?> FindByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken cancellationToken) =>
        _db.Users
            .Include(x => x.RefreshTokens)
            .FirstOrDefaultAsync(
                u => u.RefreshTokens.Any(rt => rt.TokenHash == refreshTokenHash),
                cancellationToken
            );

    public Task AddAsync(User user, CancellationToken cancellationToken) =>
        _db.Users.AddAsync(user, cancellationToken).AsTask();

    public void TrackNewRefreshToken(RefreshToken token) =>
        _db.RefreshTokens.Add(token);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        _db.SaveChangesAsync(cancellationToken);
}

