using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class UserExperienceManager
{
    private readonly AppDbContext dbContext;

    public UserExperienceManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task ProcessTestSessionCompletedAsync(TestSession session)
    {
        double experienceDelta = await GetTestSessionCompletionDeltaExperienceAsync(session);
        await ProcessExperienceAsync(session.UserId, experienceDelta);
    }

    public async Task ProcessTestSessionDeletedAsync(TestSession session)
    {
        double experienceDelta = await GetTestSessionCompletionDeltaExperienceAsync(session);
        await ProcessExperienceAsync(session.UserId, -experienceDelta);
    }

    private async Task ProcessExperienceAsync(Guid userId, double experience)
    {
        if (experience == 0d) return;

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id ==  userId);

        if (user == null) return;

        user.Experience += experience;

        double requiredExperience = GetRequiredExperience();
        while (user.Experience >= requiredExperience)
        {
            user.Experience -= requiredExperience;
            user.Level++;
            requiredExperience = GetRequiredExperience();
        }

        await dbContext.SaveChangesAsync();

        double GetRequiredExperience()
        {
            return 30 * Math.Pow(user.Level + 1, 1.25d);
        }
    }

    private async Task<double> GetTestSessionCompletionDeltaExperienceAsync(TestSession session)
    {
        var testInfo = await dbContext.Tests
            .AsNoTracking()
            .Select(t => new
            {
                t.Id,
                t.MaxScore,
                t.MaxExperience,
                MaxUserScore = t.TestSessions
                    .Where(ts => ts.UserId == session.UserId && ts.Id != session.Id && ts.IsCompleted)
                    .Select(ts => ts.Score)
                    .DefaultIfEmpty(0d)
                    .Max()
            })
            .FirstOrDefaultAsync(t => t.Id == session.TestId);

        if (testInfo == null) return 0d;
        if (session.Score <= testInfo.MaxUserScore) return 0d;

        double completionDelta = (session.Score - testInfo.MaxUserScore) / testInfo.MaxScore;
        double experience = completionDelta * testInfo.MaxExperience;
        return experience;
    }
}
