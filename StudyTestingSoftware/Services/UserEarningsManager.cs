using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class UserEarningsManager
{
    private readonly AppDbContext dbContext;

    public UserEarningsManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task ProcessTestSessionCompletedAsync(TestSession session)
    {
        await ProcessTestOperation(session, false);
    }

    public async Task ProcessTestSessionDeletedAsync(TestSession session)
    {
        await ProcessTestOperation(session, true);
    }

    private async Task ProcessTestOperation(TestSession session, bool wasDeleted)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == session.UserId);
        if (user == null) return;

        var (experienceDelta, coinsDelta) = await GetTestSessionCompletionDeltasAsync(session);
        if (wasDeleted)
        {
            experienceDelta = -experienceDelta;
            coinsDelta = -coinsDelta;
        }
        ProcessExperienceInMemory(user, experienceDelta);
        ProcessCoinsInMemory(user, coinsDelta);

        await dbContext.SaveChangesAsync();
    }

    private static void ProcessExperienceInMemory(AppUser user, double experience)
    {
        if (experience == 0d) return;

        user.Experience += experience;

        user.RequiredExperience = GetRequiredExperience(user.Level);
        while (user.Experience >= user.RequiredExperience)
        {
            user.Experience -= user.RequiredExperience;
            user.Level++;
            user.RequiredExperience = GetRequiredExperience(user.Level);
        }
    }

    private static void ProcessCoinsInMemory(AppUser user, int coins)
    {
        if (coins == 0) return;

        user.Coins = Math.Max(0, user.Coins + coins);
    }

    public static double GetRequiredExperience(int level)
    {
        return 30 * Math.Pow(level, 1.25d);
    }

    private async Task<(double experienceDelta, int coinsDelta)> GetTestSessionCompletionDeltasAsync(TestSession session)
    {
        var testInfo = await dbContext.Tests
            .AsNoTracking()
            .Select(t => new
            {
                t.Id,
                t.MaxScore,
                t.MaxExperience,
                t.MaxCoins,
                MaxUserScore =
                    dbContext.TestSessions
                        .Where(ts => ts.TestId == t.Id
                                     && ts.UserId == session.UserId
                                     && ts.Id != session.Id
                                     && ts.IsCompleted)
                        .Select(ts => (double?)ts.Score)
                        .Max() ?? 0d
            })
            .FirstOrDefaultAsync(t => t.Id == session.TestId);

        if (testInfo == null) return (0d, 0);
        if (session.Score <= testInfo.MaxUserScore) return (0d, 0);

        double completionDelta = (session.Score - testInfo.MaxUserScore) / testInfo.MaxScore;
        double experience = completionDelta * testInfo.MaxExperience;
        int coins = (int)(completionDelta * testInfo.MaxCoins);
        return (experience, coins);
    }
}
