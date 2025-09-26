using Microsoft.AspNetCore.Mvc.ModelBinding;
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
}
