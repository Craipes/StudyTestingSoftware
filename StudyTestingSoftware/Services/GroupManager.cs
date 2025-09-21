using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class GroupManager
{
    private readonly AppDbContext dbContext;

    public GroupManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<Guid>> ListGroupIdsByAuthorAsync(Guid authorId)
    {
        return await dbContext.StudentGroups
            .Where(g => g.OwnerId == authorId)
            .Select(g => g.Id)
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
}
