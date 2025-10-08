using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class TestReadManager
{
    private readonly AppDbContext dbContext;

    public TestReadManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<Guid>> ListTestIdsByAuthorAsync(Guid authorId)
    {
        return await dbContext.Tests
            .Where(t => t.AuthorId == authorId)
            .Select(t => t.Id)
            .ToListAsync();
    }

    public async Task<List<TeacherTestPreviewDTO>> ListTeacherTestPreviewsByAuthorAsync(Guid authorId)
    {
        return await dbContext.Tests
            .AsNoTracking()
            .Where(t => t.AuthorId == authorId)
            .OrderByDescending(t => t.IsOpened)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => new TeacherTestPreviewDTO(
                t.Id,
                t.Name,
                t.AccessMode,
                t.IsPublished,
                t.IsOpened,
                t.HasCloseTime,
                t.CloseAt,
                t.Questions.Count
            ))
            .ToListAsync();
    }

    public async Task<List<TeacherTestPreviewDTO>> ListTeacherTestPreviewsByGroupAsync(Guid groupId, Guid? authorId)
    {
        return await dbContext.Tests
            .AsNoTracking()
            .Where(t => t.AuthorId == authorId || (t.IsPublished && t.AccessMode != TestAccessMode.Private))
            .Where(t => t.OpenedToGroups.Any(g => g.Id == groupId))
            .OrderByDescending(t => t.IsOpened)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => new TeacherTestPreviewDTO(
                t.Id,
                t.Name,
                t.AccessMode,
                t.IsPublished,
                t.IsOpened,
                t.HasCloseTime,
                t.CloseAt,
                t.Questions.Count
            ))
            .ToListAsync();
    }

    public async Task<Test?> LoadTestDefinitionAsync(Guid id)
    {
        return await dbContext.Tests
            .Where(t => t.Id == id)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }

    public async Task<Test?> LoadTestAsync(Guid id, bool track)
    {
        IQueryable<Test> query = dbContext.Tests
            .Where(t => t.Id == id)
            .Include(t => t.Questions)
                .ThenInclude(q => q.QuestionRows)
                    .ThenInclude(r => r.CorrectMatrixColumn)
            .Include(t => t.Questions)
                .ThenInclude(q => q.QuestionColumns)
            .Include(t => t.Questions)
                .ThenInclude(q => q.ChoiceOptions);
        if (!track) query = query.AsNoTracking();
        return await query.FirstOrDefaultAsync();
    }

    public async Task<TeacherPaginatedTestViewDTO?> LoadTestViewForTeacherAsync(Guid id, Guid authorId, int pageSize, int pageNumber)
    {
        var meta = await dbContext.Tests
            .AsNoTracking()
            .Where(t => t.Id == id && t.AuthorId == authorId)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                QuestionsCount = t.Questions.Count,
                TotalPoints = t.MaxScore,
                t.IsPublished,
                t.IsOpened,
                t.AccessMode,
                t.DurationInMinutes,
                t.AttemptsLimit,
                t.HasCloseTime,
                t.CloseAt
            })
            .FirstOrDefaultAsync();

        if (meta == null)
        {
            return null;
        }

        var groupedUserStats = dbContext.TestSessions
            .AsNoTracking()
            .Where(ts => ts.TestId == id)
            .GroupBy(ts => ts.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                AttemptsCount = g.Count(),
                BestScore = g.Max(s => s.Score),
                LastAttemptAt = g.Max(s => s.FinishedAt)
            });

        var totalCount = await groupedUserStats.CountAsync();

        if (pageSize <= 0) pageSize = 10;
        int maxPageNumber = Math.Max((int)Math.Ceiling((double)totalCount / pageSize) - 1, 0);
        pageNumber = Math.Clamp(pageNumber - 1, 0, maxPageNumber);

        var pagedUsersQuery = groupedUserStats
            .Join(
                dbContext.Users.AsNoTracking(),
                g => g.UserId,
                u => u.Id,
                (g, u) => new
                {
                    g.UserId,
                    u.FirstName,
                    u.LastName,
                    u.MiddleName,
                    g.AttemptsCount,
                    g.BestScore,
                    g.LastAttemptAt
                });

        var users = await pagedUsersQuery
            .OrderByDescending(x => x.LastAttemptAt)
            .ThenBy(x => x.UserId)
            .Skip(pageSize * pageNumber)
            .Take(pageSize)
            .Select(x => new TeacherTestUserPreviewDTO(
                new ShortUserInfoDTO(x.UserId, x.FirstName, x.LastName, x.MiddleName),
                x.AttemptsCount,
                x.BestScore,
                x.LastAttemptAt
            ))
            .ToListAsync();

        return new TeacherPaginatedTestViewDTO(
            meta.Id,
            meta.Name,
            meta.Description,
            meta.QuestionsCount,
            meta.TotalPoints,
            meta.IsPublished,
            meta.IsOpened,
            meta.AccessMode,
            meta.DurationInMinutes,
            meta.AttemptsLimit,
            meta.HasCloseTime,
            meta.CloseAt,
            users,
            maxPageNumber + 1
        );
    }
}
