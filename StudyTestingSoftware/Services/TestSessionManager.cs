using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class TestSessionManager
{
    private readonly AppDbContext dbContext;
    private readonly UserManager<AppUser> userManager;
    private readonly TestReadManager testReadManager;

    public TestSessionManager(AppDbContext dbContext, UserManager<AppUser> userManager, TestReadManager testReadManager)
    {
        this.dbContext = dbContext;
        this.userManager = userManager;
        this.testReadManager = testReadManager;
    }

    public async Task<TestSession?> StartSessionAsync(Guid testId, Guid userId)
    {
        var test = await dbContext.Tests.AsNoTracking().FirstOrDefaultAsync(t => t.Id == testId);
        if (test == null || !test.IsOpened || !test.IsPublished) return null;

        if (test.AccessMode == TestAccessMode.Private && test.AuthorId != userId) return null;

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        if (test.AccessMode == TestAccessMode.Group)
        {
            var isInGroup = await dbContext.StudentGroups
                .AsNoTracking()
                .Where(g => g.OpenedTests.Any(t => t.Id == testId))
                .AnyAsync(g => g.Students.Any(s => s.Id == userId));

            if (!isInGroup) return null;
        }

        var now = DateTime.UtcNow;
        DateTime? autoFinishAt = test.DurationInMinutes > 0 ? now.AddMinutes(test.DurationInMinutes) : null;

        var session = new TestSession
        {
            Test = test,
            User = user,
            StartedAt = now,
            AutoFinishAt = autoFinishAt,
            IsCompleted = false,
            Score = 0d
        };

        dbContext.TestSessions.Add(session);
        await dbContext.SaveChangesAsync();
        return session;
    }

    public async Task<int> FinalizeExpiredSessionsAsync(int batchSize, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        // Load a small batch of expired, not-yet-completed sessions
        var sessions = await dbContext.TestSessions
            .Where(s => !s.IsCompleted && s.AutoFinishAt != null && s.AutoFinishAt <= now)
            .OrderBy(s => s.AutoFinishAt)
            .Take(batchSize)
            .ToListAsync(ct);

        if (sessions.Count == 0) return 0;

        foreach (var session in sessions)
        {
            FinalizeSessionInMemory(session);
            var test = await testReadManager.LoadTestAsync(session.TestId, false);
            if (test != null) UpdateScoreInMemory(session, test);
        }

        await dbContext.SaveChangesAsync(ct);
        return sessions.Count;
    }

    public void FinalizeSessionInMemory(TestSession session)
    {
        if (session.IsCompleted) return;
        var finishedAt = session.AutoFinishAt ?? DateTime.UtcNow;
        session.FinishedAt = finishedAt;
        session.IsCompleted = true;
    }

    private static void UpdateScoreInMemory(TestSession session, Test test)
    {
        double totalScore = 0d;
        foreach (var question in test.Questions)
        {
            var answers = session.UserAnswers.Where(a => a.QuestionId == question.Id).ToList();
            if (answers == null) continue;
            switch (question.QuestionType)
            {
                case QuestionType.YesNo:
                    if (answers.Count != 1) break;
                    if (answers[0].BoolValue == question.TargetBoolValue)
                        totalScore += question.Points;
                    break;
                case QuestionType.Slider:
                        if (answers.Count != 1) break;
                        if (answers[0].NumberValue == question.TargetNumberValue)
                            totalScore += question.Points;
                        break;
                case QuestionType.SingleChoice:
                        if (answers.Count != 1) break;
                        var correctOption = question.ChoiceOptions.FirstOrDefault(o => o.IsCorrect);
                        if (correctOption != null && answers[0].SelectedChoiceOptionId == correctOption.Id)
                            totalScore += question.Points;
                        break;
                case QuestionType.MultipleChoice:
                        if (question.ChoiceOptions.Count == 0) break;
                        var selectedOptions = answers.Select(a => a.SelectedChoiceOptionId).ToHashSet();

                        int correctCount = 0;
                        foreach (var option in question.ChoiceOptions)
                        {
                            if (option.IsCorrect == selectedOptions.Contains(option.Id))
                            {
                                correctCount++;
                            }
                        }

                        totalScore += (double)question.Points * correctCount / question.ChoiceOptions.Count;
                        break;
                case QuestionType.TableSingleChoice:
                case QuestionType.Ordering:
                        int correctMultipleCount = 0;
                        foreach (var row in question.QuestionRows)
                        {
                            var correctColumnId = row.CorrectMatrixColumnId;
                            if (answers.FirstOrDefault(a => a.SelectedMatrixRowId == row.Id)?.SelectedMatrixColumnId == correctColumnId)
                            {
                            correctMultipleCount++;
                            }
                        }

                        totalScore += (double)question.Points * correctMultipleCount / question.QuestionRows.Count;
                        break;
            }
        }

        session.Score = totalScore;
    }

    public async Task UpdateScoreForTestSessionsAsync(Test test)
    {
        var sessions = await dbContext.TestSessions
            .Where(s => s.TestId == test.Id && s.IsCompleted)
            .ToListAsync();
        if (sessions.Count == 0) return;

        foreach (var session in sessions)
        {
            UpdateScoreInMemory(session, test);
        }
        await dbContext.SaveChangesAsync();
    }

    public async Task<bool> TryFinalizeSessionByIdAsync(Guid sessionId)
    {
        var session = await dbContext.TestSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session == null) return false;
        if (session.IsCompleted) return true;

        // If it is expired (safety check), finalize
        var now = DateTime.UtcNow;
        if (session.AutoFinishAt != null && session.AutoFinishAt <= now)
        {
            FinalizeSessionInMemory(session);
            var test = await testReadManager.LoadTestAsync(session.TestId, false);
            if (test != null) UpdateScoreInMemory(session, test);
            await dbContext.SaveChangesAsync();
            return true;
        }

        return false;
    }

    public async Task<List<StudentTestPreviewDTO>> ListAvailableTestsForStudentAsync(Guid studentId, int pageSize, int pageNumber)
    {
        if (pageSize <= 0) pageSize = 10;
        if (pageNumber <= 0) pageNumber = 0;
        var query = dbContext.Tests
            .Where(t => t.IsPublished && (t.AccessMode != TestAccessMode.Private || t.AuthorId == studentId))
            .Where(t => !t.HasCloseTime || (t.CloseAt != null && t.CloseAt > DateTime.UtcNow))
            .Where(t => t.AccessMode != TestAccessMode.Group || t.OpenedToGroups.Any(g => g.Students.Any(m => m.Id == studentId)))
            .OrderByDescending(t => t.IsOpened)
            .ThenBy(t => t.CloseAt)
            .Skip(pageSize * pageNumber)
            .Take(pageSize);
        return await GetStudentTestPreviewDTOsAsync(query);
    }

    private static async Task<List<StudentTestPreviewDTO>> GetStudentTestPreviewDTOsAsync(IQueryable<Test> query)
    {
        return await query
            .AsNoTracking()
            .Select(t => new StudentTestPreviewDTO(
                t.Id,
                t.Name,
                t.Description,
                t.AccessMode,
                t.IsPublished,
                t.IsOpened,
                t.HasCloseTime,
                t.CloseAt,
                t.Questions.Count,
                t.DurationInMinutes,
                t.AttemptsLimit))
            .ToListAsync();
    }
}
