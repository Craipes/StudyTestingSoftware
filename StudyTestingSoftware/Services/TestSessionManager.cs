using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudyTestingSoftware.Models.Tests;
using System.Threading.Tasks;

namespace StudyTestingSoftware.Services;

public class TestSessionManager
{
    private readonly AppDbContext dbContext;
    private readonly UserManager<AppUser> userManager;
    private readonly TestReadManager testReadManager;
    private readonly CustomUserManager customUserManager;
    private readonly UserEarningsManager userExperienceManager;

    public TestSessionManager(AppDbContext dbContext, UserManager<AppUser> userManager, TestReadManager testReadManager, CustomUserManager customUserManager, UserEarningsManager userExperienceManager)
    {
        this.dbContext = dbContext;
        this.userManager = userManager;
        this.testReadManager = testReadManager;
        this.customUserManager = customUserManager;
        this.userExperienceManager = userExperienceManager;
    }

    public async Task<AResult<TestSession>> StartSessionAsync(Guid testId, Guid userId)
    {
        if (await dbContext.TestSessions.AnyAsync(s => s.UserId == userId && !s.IsCompleted))
        {
            return AResult<TestSession>.Failure(AProblem.Conflict(TestSessionErrors.UserHasActiveSession, "User already has an active test session."));
        }

        var test = await dbContext.Tests.FirstOrDefaultAsync(t => t.Id == testId);
        if (test == null || !test.IsOpened || !test.IsPublished) return AResult<TestSession>.Failure(AProblem.NotFound(TestSessionErrors.TestNotAvailable));

        if (test.AccessMode == TestAccessMode.Private && test.AuthorId != userId) return AResult<TestSession>.Failure(AProblem.NotFound(TestSessionErrors.TestNotAvailable));

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) return AResult<TestSession>.Failure(AProblem.Unauthorized(GeneralErrors.UnauthorizedAccess));

        if (test.AccessMode == TestAccessMode.Group)
        {
            var isInGroup = await dbContext.StudentGroups
                .AsNoTracking()
                .Where(g => g.OpenedTests.Any(t => t.Id == testId))
                .AnyAsync(g => g.Students.Any(s => s.Id == userId));

            if (!isInGroup) return AResult<TestSession>.Failure(AProblem.NotFound(TestSessionErrors.TestNotAvailable));
        }

        if (test.AttemptsLimit != 0)
        {
            var previousAttempts = await dbContext.TestSessions
                .AsNoTracking()
                .CountAsync(s => s.UserId == userId && s.TestId == testId);
            if (previousAttempts >= test.AttemptsLimit) return AResult<TestSession>.Failure(AProblem.Forbidden(TestSessionErrors.AttemptLimitReached));
        }

        var now = DateTime.UtcNow;
        DateTime? autoFinishAt = test.DurationInMinutes > 0 ? now.AddMinutes(test.DurationInMinutes) : null;

        var session = new TestSession
        {
            Test = test,
            User = user,
            RandomSeed = Random.Shared.Next(),
            StartedAt = now,
            AutoFinishAt = autoFinishAt,
            IsCompleted = false,
            Score = 0d
        };

        dbContext.TestSessions.Add(session);
        await dbContext.SaveChangesAsync();
        return session;
    }

    public async Task<AResult<StudentTestSessionDTO>> GetStudentSessionDTO(Guid sessionId, Guid studentId)
    {
        var session = await dbContext.TestSessions
            .AsNoTracking()
            .Include(s => s.UserAnswers)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == studentId);

        if (session == null) return AResult<StudentTestSessionDTO>.Failure(AProblem.NotFound(GeneralErrors.ResourceNotFound));

        var test = await testReadManager.LoadTestAsync(session.TestId, false);

        if (test == null) return AResult<StudentTestSessionDTO>.Failure(AProblem.NotFound(GeneralErrors.ResourceNotFound));

        var random = new Random(session.RandomSeed);
        var answers = session.UserAnswers;
        List<StudentTestSessionQuestionDTO> questions = [];
        foreach (var question in test.Questions)
        {
            double? selectedNumber = null;
            bool? selectedBoolean = null;

            List<StudentTestSessionChoiceOptionDTO> choiceOptions = [];
            List<StudentTestSessionMatrixColumnDTO> questionColumns = [];
            List<StudentTestSessionMatrixRowDTO> questionRows = [];

            switch (question.QuestionType)
            {
                case QuestionType.YesNo:
                    selectedBoolean = answers.FirstOrDefault(a => a.QuestionId == question.Id)?.BoolValue;
                    break;
                case QuestionType.Slider:
                    selectedNumber = answers.FirstOrDefault(a => a.QuestionId == question.Id)?.NumberValue;
                    break;
                case QuestionType.SingleChoice:
                case QuestionType.MultipleChoice:
                    choiceOptions = question.ChoiceOptions
                        .Select(o => new StudentTestSessionChoiceOptionDTO(
                            o.Id,
                            o.Text,
                            answers.Any(a => a.QuestionId == question.Id && a.SelectedChoiceOptionId == o.Id)))
                        .ToList();
                    if (test.ShuffleAnswers) choiceOptions.Shuffle(random);
                    break;
                case QuestionType.TableSingleChoice:
                case QuestionType.Ordering:
                    questionColumns = question.QuestionColumns
                        .Select(c => new StudentTestSessionMatrixColumnDTO(c.Id, c.Text))
                        .ToList();
                    questionRows = question.QuestionRows
                        .Select(r => new StudentTestSessionMatrixRowDTO(
                            r.Id,
                            r.Text,
                            answers.FirstOrDefault(a => a.QuestionId == question.Id && a.SelectedMatrixRowId == r.Id)?.SelectedMatrixColumnId))
                        .ToList();
                    if (test.ShuffleAnswers || question.QuestionType == QuestionType.Ordering) questionColumns.Shuffle(random);
                    break;
            }

            questions.Add(new StudentTestSessionQuestionDTO(
                question.Id,
                question.Text,
                question.Points,
                question.QuestionType,
                question.MinNumberValue,
                question.MaxNumberValue,
                question.NumberValueStep,
                selectedNumber,
                selectedBoolean,
                questionRows,
                questionColumns,
                choiceOptions));
        }

        if (test.ShuffleQuestions) questions.Shuffle(random);

        return new StudentTestSessionDTO(
            session.Id,
            test.Name,
            session.StartedAt,
            session.FinishedAt,
            session.AutoFinishAt,
            session.Score,
            session.IsCompleted,
            test.DurationInMinutes,
            questions);
    }

    public async Task<AResult> SubmitAnswerAsync(StudentAnswerSubmitDTO answerDTO, Guid userId)
    {
        var session = await dbContext.TestSessions
            .Include(s => s.UserAnswers.Where(a => a.QuestionId == answerDTO.QuestionId))
            .FirstOrDefaultAsync(s => s.Id == answerDTO.SessionId && s.UserId == userId);

        if (session == null || session.IsCompleted) return AResult.Failure(AProblem.NotFound(GeneralErrors.ResourceNotFound));

        var question = await dbContext.Questions
            .AsNoTracking()
            .Include(q => q.ChoiceOptions)
            .Include(q => q.QuestionRows)
            .Include(q => q.QuestionColumns)
            .FirstOrDefaultAsync(q => q.Id == answerDTO.QuestionId);

        if (question == null || question.TestId != session.TestId) return AResult.Failure(AProblem.NotFound(GeneralErrors.ResourceNotFound));

        var answers = session.UserAnswers;
        switch (question.QuestionType)
        {
            case QuestionType.YesNo:
                if (answerDTO.ResetValue)
                {
                    dbContext.TestUserAnswers.RemoveRange(answers);
                    await dbContext.SaveChangesAsync();
                    return AResult.Success();
                }
                if (answerDTO.BooleanValue == null) return AResult.Failure(AProblem.Validation(GeneralErrors.InvalidInput));
                if (answers.Count == 0)
                {
                    var answer = new TestUserAnswer
                    {
                        TestSession = null!,
                        Question = null!,
                        BoolValue = answerDTO.BooleanValue,
                        QuestionId = question.Id,
                        TestSessionId = session.Id
                    };
                    dbContext.TestUserAnswers.Add(answer);
                }
                else
                {
                    var existingAnswer = answers[0];
                    existingAnswer.BoolValue = answerDTO.BooleanValue;
                    dbContext.TestUserAnswers.Update(existingAnswer);
                }
                await dbContext.SaveChangesAsync();
                return AResult.Success();
            case QuestionType.Slider:
                if (answerDTO.ResetValue)
                {
                    dbContext.TestUserAnswers.RemoveRange(answers);
                    await dbContext.SaveChangesAsync();
                    return AResult.Success();
                }
                if (answerDTO.NumberValue == null
                    || answerDTO.NumberValue < question.MinNumberValue
                    || answerDTO.NumberValue > question.MaxNumberValue)
                    return AResult.Failure(AProblem.Validation(GeneralErrors.InvalidInput));

                if (answers.Count == 0)
                {
                    var answer = new TestUserAnswer
                    {
                        TestSession = null!,
                        Question = null!,
                        NumberValue = answerDTO.NumberValue,
                        QuestionId = question.Id,
                        TestSessionId = session.Id
                    };
                    dbContext.TestUserAnswers.Add(answer);
                }
                else
                {
                    var existingAnswer = answers[0];
                    existingAnswer.NumberValue = answerDTO.NumberValue;
                    dbContext.TestUserAnswers.Update(existingAnswer);
                }
                await dbContext.SaveChangesAsync();
                return AResult.Success();
            case QuestionType.SingleChoice:
                if (answerDTO.ResetValue)
                {
                    dbContext.TestUserAnswers.RemoveRange(answers);
                    await dbContext.SaveChangesAsync();
                    return AResult.Success();
                }

                if (answerDTO.SelectedChoiceOptionId == null
                    || !question.ChoiceOptions.Any(o => o.Id == answerDTO.SelectedChoiceOptionId))
                    return AResult.Failure(AProblem.Validation(GeneralErrors.InvalidInput));

                if (answers.Count == 0)
                {
                    var answer = new TestUserAnswer
                    {
                        TestSession = null!,
                        Question = null!,
                        SelectedChoiceOptionId = answerDTO.SelectedChoiceOptionId,
                        QuestionId = question.Id,
                        TestSessionId = session.Id
                    };
                    dbContext.TestUserAnswers.Add(answer);
                }
                else
                {
                    var existingAnswer = answers[0];
                    existingAnswer.SelectedChoiceOptionId = answerDTO.SelectedChoiceOptionId;
                    dbContext.TestUserAnswers.Update(existingAnswer);
                }
                await dbContext.SaveChangesAsync();
                return AResult.Success();
            case QuestionType.MultipleChoice:
                if (answerDTO.SelectedChoiceOptionId == null
                    || !question.ChoiceOptions.Any(o => o.Id == answerDTO.SelectedChoiceOptionId))
                    return AResult.Failure(AProblem.Validation(GeneralErrors.InvalidInput));

                var existing = answers.FirstOrDefault(a => a.SelectedChoiceOptionId == answerDTO.SelectedChoiceOptionId);
                if (existing != null)
                {
                    if (answerDTO.ResetValue)
                    {
                        dbContext.TestUserAnswers.Remove(existing);
                    }
                }
                else
                {
                    if (!answerDTO.ResetValue)
                    {
                        var answer = new TestUserAnswer
                        {
                            TestSession = null!,
                            Question = null!,
                            SelectedChoiceOptionId = answerDTO.SelectedChoiceOptionId,
                            QuestionId = question.Id,
                            TestSessionId = session.Id
                        };
                        dbContext.TestUserAnswers.Add(answer);
                    }
                }

                await dbContext.SaveChangesAsync();
                return AResult.Success();
            case QuestionType.TableSingleChoice:
            case QuestionType.Ordering:
                if (answerDTO.SelectedMatrixColumnId == null
                    || answerDTO.SelectedMatrixRowId == null
                    || !question.QuestionColumns.Any(o => o.Id == answerDTO.SelectedMatrixColumnId)
                    || !question.QuestionRows.Any(o => o.Id == answerDTO.SelectedMatrixRowId))
                    return AResult.Failure(AProblem.Validation(GeneralErrors.InvalidInput));

                var existingRowAnswer = answers.FirstOrDefault(a => a.SelectedMatrixRowId == answerDTO.SelectedMatrixRowId);
                if (existingRowAnswer != null)
                {
                    if (answerDTO.ResetValue)
                    {
                        dbContext.TestUserAnswers.Remove(existingRowAnswer);
                    }
                    else
                    {
                        existingRowAnswer.SelectedMatrixColumnId = answerDTO.SelectedMatrixColumnId;
                        dbContext.TestUserAnswers.Update(existingRowAnswer);
                    }
                }
                else
                {
                    if (!answerDTO.ResetValue)
                    {
                        var answer = new TestUserAnswer
                        {
                            TestSession = null!,
                            Question = null!,
                            SelectedMatrixColumnId = answerDTO.SelectedMatrixColumnId,
                            SelectedMatrixRowId = answerDTO.SelectedMatrixRowId,
                            QuestionId = question.Id,
                            TestSessionId = session.Id
                        };
                        dbContext.TestUserAnswers.Add(answer);
                    }
                }

                await dbContext.SaveChangesAsync();
                return AResult.Success();
            default:
                return AResult.Failure(AProblem.Validation(GeneralErrors.InvalidInput));
        }
    }

    public async Task<List<StudentActiveTestSessionPreviewDTO>> GetActiveStudentTestSessionsAsync(Guid userId)
    {
        return await dbContext.TestSessions
            .AsNoTracking()
            .Where(s => s.UserId == userId && !s.IsCompleted)
            .OrderByDescending(s => s.StartedAt)
            .Select(s => new StudentActiveTestSessionPreviewDTO(
                s.Id,
                s.Test.Name,
                s.StartedAt,
                s.AutoFinishAt,
                s.Test.DurationInMinutes))
            .ToListAsync();
    }

    public async Task<StudentCompletedTestSessionPreviewPaginationDTO> GetCompletedStudentTestSessionsAsync(Guid userId, int pageSize, int pageNumber)
    {
        var query = dbContext.TestSessions
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.IsCompleted);

        var totalCount = await query.CountAsync();
        if (pageSize <= 0) pageSize = 10;
        int maxPageNumber = Math.Max((int)Math.Ceiling((double)totalCount / pageSize) - 1, 0);
        pageNumber = Math.Clamp(pageNumber - 1, 0, maxPageNumber);

        var items = await query
            .OrderByDescending(s => s.StartedAt)
            .Skip(pageSize * pageNumber)
            .Take(pageSize)
            .Select(s => new StudentCompletedTestSessionPreviewDTO(
                s.Id,
                s.Test.Name,
                s.StartedAt,
                s.FinishedAt,
                s.Score,
                s.Test.MaxScore))
            .ToListAsync();

        return new StudentCompletedTestSessionPreviewPaginationDTO(items, maxPageNumber + 1);
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
            if (test != null) await UpdateScoreInMemoryAsync(session, test);
        }

        await dbContext.SaveChangesAsync(ct);
        return sessions.Count;
    }

    public void FinalizeSessionInMemory(TestSession session)
    {
        if (session.IsCompleted) return;
        var now = DateTime.UtcNow;
        var finishedAt = session.AutoFinishAt != null && session.AutoFinishAt < now
            ? session.AutoFinishAt.Value
            : now;

        session.FinishedAt = finishedAt;
        session.IsCompleted = true;
    }

    private async Task UpdateScoreInMemoryAsync(TestSession session, Test test)
    {
        double totalScore = 0d;
        var allAnswers = await dbContext.TestUserAnswers
            .AsNoTracking()
            .Where(a => a.TestSessionId == session.Id)
            .ToListAsync();

        foreach (var question in test.Questions)
        {
            var answers = allAnswers.Where(a => a.QuestionId == question.Id).ToList();
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

        await userExperienceManager.ProcessTestSessionCompletedAsync(session);
    }

    public async Task UpdateScoreForTestSessionsAsync(Test test)
    {
        var sessions = await dbContext.TestSessions
            .Where(s => s.TestId == test.Id && s.IsCompleted)
            .ToListAsync();
        if (sessions.Count == 0) return;

        foreach (var session in sessions)
        {
            await UpdateScoreInMemoryAsync(session, test);
        }
        await dbContext.SaveChangesAsync();
    }

    public async Task<AResult> SubmitSessionByIdAndUserAsync(Guid sessionId, Guid userId)
    {
        var session = await dbContext.TestSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
        if (session == null || session.IsCompleted) return AResult.Failure(AProblem.NotFound(GeneralErrors.ResourceNotFound));

        FinalizeSessionInMemory(session);
        var test = await testReadManager.LoadTestAsync(session.TestId, false);
        if (test != null) await UpdateScoreInMemoryAsync(session, test);
        await dbContext.SaveChangesAsync();
        return AResult.Success();
    }

    public async Task<bool> TryFinalizeSessionByIdAsync(Guid sessionId)
    {
        var session = await dbContext.TestSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        return await TryFinalizeSessionAsync(session);
    }

    private async Task<bool> TryFinalizeSessionAsync(TestSession? session)
    {
        if (session == null) return false;
        if (session.IsCompleted) return true;

        // If it is expired (safety check), finalize
        var now = DateTime.UtcNow;
        if (session.AutoFinishAt != null && session.AutoFinishAt <= now)
        {
            FinalizeSessionInMemory(session);
            var test = await testReadManager.LoadTestAsync(session.TestId, false);
            if (test != null) await UpdateScoreInMemoryAsync(session, test);
            await dbContext.SaveChangesAsync();
            return true;
        }

        return false;
    }

    public async Task<StudentTestPreviewPaginationDTO> ListAvailableTestsForStudentAsync(Guid studentId, int pageSize, int pageNumber)
    {
        IQueryable<Test> baseQuery = GetBaseAvailableTestsQuery(studentId)
            .Where(t => t.AccessMode != TestAccessMode.Group || t.OpenedToGroups.Any(g => g.Students.Any(m => m.Id == studentId)));

        var totalCount = await baseQuery.CountAsync();

        if (pageSize <= 0) pageSize = 10;
        int maxPageNumber = Math.Max((int)Math.Ceiling((double)totalCount / pageSize) - 1, 0);
        pageNumber = Math.Clamp(pageNumber - 1, 0, maxPageNumber);

        var pageQuery = baseQuery
            .OrderByDescending(t => t.IsOpened)
            .ThenBy(t => t.CloseAt)
            .Skip(pageSize * pageNumber)
            .Take(pageSize);

        var items = await GetStudentTestPreviewDTOsAsync(studentId, pageQuery);

        return new StudentTestPreviewPaginationDTO(items, maxPageNumber + 1);
    }

    public async Task<List<StudentTestPreviewDTO>> ListAvailableGroupTestsForStudentAsync(Guid groupId, Guid studentId)
    {
        IQueryable<Test> query = GetBaseAvailableTestsQuery(studentId)
            .Where(t => t.OpenedToGroups.Any(g => g.Id == groupId))
            .OrderByDescending(t => t.IsOpened)
            .ThenBy(t => t.CloseAt);
        var groups = await query.Select(q => q.OpenedToGroups).ToListAsync();
        return await GetStudentTestPreviewDTOsAsync(studentId, query);
    }

    private IQueryable<Test> GetBaseAvailableTestsQuery(Guid studentId)
    {
        var now = DateTime.UtcNow;
        return dbContext.Tests
            .Where(t => t.IsPublished && (t.AccessMode != TestAccessMode.Private || t.AuthorId == studentId))
            .Where(t => !t.HasCloseTime || (t.CloseAt != null && t.CloseAt > now));
    }

    private async Task<List<StudentTestPreviewDTO>> GetStudentTestPreviewDTOsAsync(Guid studentId, IQueryable<Test> query)
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
                t.AttemptsLimit,
                dbContext.TestSessions
                .AsNoTracking()
                .Count(s => s.UserId == studentId && s.TestId == t.Id)
                ))
            .ToListAsync();
    }

    public async Task<TeacherTestUserSessionsDTO?> LoadUserSessionsAsync(AppUser authorId, Guid testId, Guid userId)
    {
        int testMaxScore = await dbContext.Tests
            .AsNoTracking()
            .Where(t => t.Id == testId && t.AuthorId == authorId.Id)
            .Select(t => t.MaxScore)
            .FirstOrDefaultAsync();

        if (testMaxScore == 0)
        {
            return null;
        }

        var sessions = await dbContext.TestSessions
            .AsNoTracking()
            .Where(ts => ts.TestId == testId && ts.UserId == userId)
            .Select(ts => new TeacherTestSessionPreviewDTO(
                ts.Id,
                ts.StartedAt,
                ts.FinishedAt,
                ts.Score,
                ts.IsCompleted
            ))
            .ToListAsync();

        sessions ??= [];

        var userInfo = await customUserManager.GetInfoAsync(userId, false);

        if (userInfo == null)
        {
            return null;
        }

        return new TeacherTestUserSessionsDTO(
            userInfo,
            testMaxScore,
            sessions.Count > 0 ? sessions.Max(s => s.Score) : 0,
            sessions);
    }

    public async Task<bool> DeleteUserSessionAsync(Guid sessionId, AppUser authorId)
    {
        var session = await dbContext.TestSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == authorId.Id);

        if (session == null)
        {
            return false;
        }

        dbContext.TestSessions.Remove(session);
        await userExperienceManager.ProcessTestSessionDeletedAsync(session);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<TeacherTestSessionDTO?> LoadSessionForTeacherAsync(AppUser author, Guid sessionId)
    {
        var session = await dbContext.TestSessions
            .AsNoTracking()
            .Include(s => s.UserAnswers)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) return null;

        var test = await testReadManager.LoadTestAsync(session.TestId, false);
        if (test == null || test.AuthorId != author.Id) return null;

        var random = new Random(session.RandomSeed);
        var answers = session.UserAnswers;

        List<TeacherTestSessionQuestionDTO> questions = [];

        foreach (var question in test.Questions)
        {
            double? selectedNumber = null;
            bool? selectedBoolean = null;

            double? validNumber = null;
            bool? validBoolean = null;

            List<TeacherTestSessionChoiceOptionDTO> choiceOptions = [];
            List<TeacherTestSessionMatrixColumnDTO> questionColumns = [];
            List<TeacherTestSessionMatrixRowDTO> questionRows = [];

            // Calculate received score for this question based on user's answers
            double receivedScore = 0d;
            var questionAnswers = answers.Where(a => a.QuestionId == question.Id).ToList();

            switch (question.QuestionType)
            {
                case QuestionType.YesNo:
                    selectedBoolean = answers.FirstOrDefault(a => a.QuestionId == question.Id)?.BoolValue;
                    validBoolean = question.TargetBoolValue;
                    if (questionAnswers.Count == 1 && selectedBoolean == question.TargetBoolValue)
                    {
                        receivedScore = question.Points;
                    }
                    break;
                case QuestionType.Slider:
                    selectedNumber = answers.FirstOrDefault(a => a.QuestionId == question.Id)?.NumberValue;
                    validNumber = question.TargetNumberValue;
                    if (questionAnswers.Count == 1 && selectedNumber == question.TargetNumberValue)
                    {
                        receivedScore = question.Points;
                    }
                    break;
                case QuestionType.SingleChoice:
                case QuestionType.MultipleChoice:
                    choiceOptions = question.ChoiceOptions
                        .Select(o => new TeacherTestSessionChoiceOptionDTO(
                            o.Id,
                            o.Text,
                            answers.Any(a => a.QuestionId == question.Id && a.SelectedChoiceOptionId == o.Id),
                            o.IsCorrect))
                        .ToList();
                    if (test.ShuffleAnswers) choiceOptions.Shuffle(random);

                    if (question.QuestionType == QuestionType.SingleChoice)
                    {
                        if (questionAnswers.Count == 1)
                        {
                            var correctOption = question.ChoiceOptions.FirstOrDefault(o => o.IsCorrect);
                            if (correctOption != null && questionAnswers[0].SelectedChoiceOptionId == correctOption.Id)
                            {
                                receivedScore = question.Points;
                            }
                        }
                    }
                    else // MultipleChoice
                    {
                        if (question.ChoiceOptions.Count > 0)
                        {
                            var selectedOptions = questionAnswers.Select(a => a.SelectedChoiceOptionId).ToHashSet();
                            int correctCount = 0;
                            foreach (var option in question.ChoiceOptions)
                            {
                                if (option.IsCorrect == selectedOptions.Contains(option.Id))
                                {
                                    correctCount++;
                                }
                            }
                            receivedScore = (double)question.Points * correctCount / question.ChoiceOptions.Count;
                        }
                    }
                    break;
                case QuestionType.TableSingleChoice:
                case QuestionType.Ordering:
                    questionColumns = question.QuestionColumns
                        .Select(c => new TeacherTestSessionMatrixColumnDTO(c.Id, c.Text))
                        .ToList();
                    questionRows = question.QuestionRows
                        .Select(r => new TeacherTestSessionMatrixRowDTO(
                            r.Id,
                            r.Text,
                            answers.FirstOrDefault(a => a.QuestionId == question.Id && a.SelectedMatrixRowId == r.Id)?.SelectedMatrixColumnId,
                            r.CorrectMatrixColumnId))
                        .ToList();
                    if (test.ShuffleAnswers || question.QuestionType == QuestionType.Ordering) questionColumns.Shuffle(random);

                    if (question.QuestionRows.Count > 0)
                    {
                        int correctMultipleCount = 0;
                        foreach (var row in question.QuestionRows)
                        {
                            var correctColumnId = row.CorrectMatrixColumnId;
                            if (questionAnswers.FirstOrDefault(a => a.SelectedMatrixRowId == row.Id)?.SelectedMatrixColumnId == correctColumnId)
                            {
                                correctMultipleCount++;
                            }
                        }
                        receivedScore = (double)question.Points * correctMultipleCount / question.QuestionRows.Count;
                    }
                    break;
            }

            questions.Add(new TeacherTestSessionQuestionDTO(
                question.Id,
                question.Text,
                question.Points,
                question.QuestionType,
                receivedScore,
                question.MinNumberValue,
                question.MaxNumberValue,
                question.NumberValueStep,
                selectedNumber,
                selectedBoolean,
                validNumber,
                validBoolean,
                questionRows,
                questionColumns,
                choiceOptions));
        }

        if (test.ShuffleQuestions) questions.Shuffle(random);

        return new TeacherTestSessionDTO(
            session.Id,
            test.Name,
            session.StartedAt,
            session.FinishedAt,
            session.AutoFinishAt,
            session.Score,
            session.IsCompleted,
            test.DurationInMinutes,
            test.MaxScore,
            questions);
    }
}
