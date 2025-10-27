using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class CustomizationManager
{
    private readonly AppDbContext dbContext;

    public CustomizationManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task GrantDefaultCustomizationItems(AppUser user)
    {
        var defaultItems = await dbContext.CustomizationItems
            .Where(i => i.UnlockedByDefault
            || (i.UnlockedByLevelUp && i.LevelRequired <= user.Level)
            || (!i.UnlockedByLevelUp && i.Price == 0))
            .ToListAsync();

        foreach (var item in defaultItems)
        {
            var userItem = new UserCustomizationItem
            {
                User = user,
                CustomizationItem = item
            };
            dbContext.UserCustomizationItems.Add(userItem);
            CheckUserForEmptyCustomizationInMemory(user, userItem);
        }
        await dbContext.SaveChangesAsync();
    }

    public async Task GrantCustomizationItemToAllUsersIfPossible(CustomizationItem item)
    {
        if (!item.UnlockedByDefault && !item.UnlockedByLevelUp && item.Price > 0) return;

        var usersToGrant = await dbContext.Users
            .Where(u => !item.UnlockedByLevelUp || u.Level >= item.LevelRequired)
            .Where(u => !dbContext.UserCustomizationItems.Any(uci => uci.UserId == u.Id && uci.CustomizationItemId == item.Id))
            .ToListAsync();

        foreach (var user in usersToGrant)
        {
            var userItem = new UserCustomizationItem
            {
                User = user,
                CustomizationItem = item
            };
            dbContext.UserCustomizationItems.Add(userItem);
            CheckUserForEmptyCustomizationInMemory(user, userItem);
        }
        await dbContext.SaveChangesAsync();
    }

    public async Task GrantCustomizationItemsOnLevelUp(AppUser user, int level, bool saveChanges)
    {
        var itemsToGrant = await dbContext.CustomizationItems
            .Where(i => i.UnlockedByLevelUp && i.LevelRequired == level)
            .ToListAsync();
        foreach (var item in itemsToGrant)
        {
            var userItem = new UserCustomizationItem
            {
                User = user,
                CustomizationItem = item
            };
            dbContext.UserCustomizationItems.Add(userItem);
            CheckUserForEmptyCustomizationInMemory(user, userItem);
        }
        if (saveChanges) await dbContext.SaveChangesAsync();
    }

    private static void CheckUserForEmptyCustomizationInMemory(AppUser user, UserCustomizationItem item)
    {
        if (item.CustomizationItem.Type == CustomizationType.Avatar && user.ActiveAvatarId == null)
        {
            user.ActiveAvatarId = item.CustomizationItemId;
        }
        else if (item.CustomizationItem.Type == CustomizationType.AvatarFrame && user.ActiveAvatarFrameId == null)
        {
            user.ActiveAvatarFrameId = item.CustomizationItemId;
        }
        else if (item.CustomizationItem.Type == CustomizationType.Background && user.ActiveBackgroundId == null)
        {
            user.ActiveBackgroundId = item.CustomizationItemId;
        }
    }
}
