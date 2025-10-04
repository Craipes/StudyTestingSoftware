using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class GroupManager
{
    private readonly UserManager<AppUser> userManager;
    private readonly AppDbContext dbContext;

    public GroupManager(UserManager<AppUser> userManager, AppDbContext dbContext)
    {
        this.userManager = userManager;
        this.dbContext = dbContext;
    }

    public async Task<bool> IsInGroupAsync(Guid groupId, Guid userId)
    {
        return await dbContext.StudentGroups
            .AsNoTracking()
            .AnyAsync(g => g.Id == groupId && g.Students.Any(s => s.Id == userId));
    }

    public async Task<List<Guid>> ListGroupIdsByAuthorAsync(Guid authorId)
    {
        return await dbContext.StudentGroups
            .Where(g => g.OwnerId == authorId)
            .Select(g => g.Id)
            .ToListAsync();
    }

    public async Task<List<TeacherGroupPreviewDTO>> GetAuthorPreviews(Guid authorId)
    {
        return await dbContext.StudentGroups
            .Where(g => g.OwnerId == authorId)
            .Select(g => new TeacherGroupPreviewDTO
            (
                g.Id,
                g.Name,
                g.Description,
                g.Students.Count,
                g.OpenedTests.Count
            ))
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<StudentGroup?> GetGroupByIdAsync(Guid groupId)
    {
        return await dbContext.StudentGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == groupId);
    }

    public async Task DeleteGroupAsync(Guid groupId)
    {
        dbContext.StudentGroups.Remove(new StudentGroup() { Id = groupId, Owner = null });
        await dbContext.SaveChangesAsync();
    }

    public async Task<StudentGroup> CreateGroupAsync(AppUser owner, TeacherGroupDTO dto)
    {
        var group = new StudentGroup
        {
            Name = dto.Name,
            Description = dto.Description,
            Owner = owner
        };

        dbContext.StudentGroups.Add(group);
        await dbContext.SaveChangesAsync();

        return group;
    }

    public async Task<StudentGroup> UpdateGroupAsync(StudentGroup group, TeacherGroupDTO dto)
    {
        dbContext.StudentGroups.Attach(group);
        group.Name = dto.Name;
        group.Description = dto.Description;
        await dbContext.SaveChangesAsync();
        return group;
    }

    public async Task<ActionResult> AddUserToGroupByIdAsync(Guid groupId, Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return new NotFoundResult();
        }
        return await AddUserToGroupAsync(groupId, user);
    }

    public async Task<ActionResult> AddUserToGroupByEmailAsync(Guid groupId, string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new NotFoundResult();
        }
        return await AddUserToGroupAsync(groupId, user);
    }

    private async Task<ActionResult> AddUserToGroupAsync(Guid groupId, AppUser appUser)
    {
        var group = await dbContext.StudentGroups
            .Include(g => g.Students)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null)
        {
            return new NotFoundResult();
        }
        if (group.Students.Any(s => s.Id == appUser.Id))
        {
            return new ConflictResult();
        }
        group.Students.Add(appUser);
        await dbContext.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<ActionResult> RemoveUserFromGroupByIdAsync(Guid groupId, Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return new NotFoundResult();
        }
        return await RemoveUserFromGroupAsync(groupId, user);
    }

    public async Task<ActionResult> RemoveUserFromGroupByEmailAsync(Guid groupId, string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new NotFoundResult();
        }
        return await RemoveUserFromGroupAsync(groupId, user);
    }

    private async Task<ActionResult> RemoveUserFromGroupAsync(Guid groupId, AppUser appUser)
    {
        var group = await dbContext.StudentGroups
            .Include(g => g.Students)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null)
        {
            return new NotFoundResult();
        }
        if (group.Students.All(s => s.Id != appUser.Id))
        {
            return new NotFoundResult();
        }
        group.Students.RemoveAll(s => s.Id == appUser.Id);
        await dbContext.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<ActionResult> AddTestToGroupAsync(Guid groupId, Guid testId)
    {
        var group = await dbContext.StudentGroups
            .Include(g => g.OpenedTests)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null)
        {
            return new NotFoundResult();
        }
        if (group.OpenedTests.Any(t => t.Id == testId))
        {
            return new ConflictResult();
        }
        var test = await dbContext.Tests.FindAsync(testId);
        if (test == null)
        {
            return new NotFoundResult();
        }
        group.OpenedTests.Add(test);
        await dbContext.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<ActionResult> RemoveTestFromGroupAsync(Guid groupId, Guid testId)
    {
        var group = await dbContext.StudentGroups
            .Include(g => g.OpenedTests)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null)
        {
            return new NotFoundResult();
        }
        if (group.OpenedTests.All(t => t.Id != testId))
        {
            return new NotFoundResult();
        }
        group.OpenedTests.RemoveAll(t => t.Id == testId);
        await dbContext.SaveChangesAsync();
        return new OkResult();
    }
}
