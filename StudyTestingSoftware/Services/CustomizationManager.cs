using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class CustomizationManager
{
    private readonly AppDbContext dbContext;

    public CustomizationManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<CustomizationItemMarketDTO>> GetMarketForUser(Guid userId)
    {
        return await dbContext.CustomizationItems
            .AsNoTracking()
            .OrderBy(item => item.Type)
            .ThenBy(item => item.Price)
            .Select(item => new CustomizationItemMarketDTO(
                item.Name,
                item.Description,
                item.Type,
                item.ImageUrl,
                item.UnlockedByDefault,
                item.UnlockedByLevelUp,
                item.Price,
                item.LevelRequired,
                dbContext.UserCustomizationItems.Any(uci => uci.UserId == userId && uci.CustomizationItemId == item.Id)
            ))
            .ToListAsync();
    }

    public async Task<bool> PurchaseCustomizationItem(AppUser user, Guid itemId)
    {
      var item = await dbContext.CustomizationItems.FindAsync(itemId);
        if (item == null) return false;
        if (item.UnlockedByDefault || item.UnlockedByLevelUp) return false;
        var alreadyOwned = await dbContext.UserCustomizationItems
            .AnyAsync(uci => uci.UserId == user.Id && uci.CustomizationItemId == itemId);
        if (alreadyOwned) return false;
        if (user.Coins < item.Price) return false;
        user.Coins -= item.Price;
        var userItem = new UserCustomizationItem
        {
            User = user,
            CustomizationItem = item
        };
        dbContext.UserCustomizationItems.Add(userItem);
        CheckUserForEmptyCustomizationInMemory(user, userItem);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task EquipCustomizationItem(AppUser user, Guid itemId)
    {
        var userItem = await dbContext.UserCustomizationItems
            .Include(uci => uci.CustomizationItem)
            .FirstOrDefaultAsync(uci => uci.UserId == user.Id && uci.CustomizationItemId == itemId);
        if (userItem == null) return;
        switch (userItem.CustomizationItem.Type)
        {
            case CustomizationType.Avatar:
                user.ActiveAvatarId = itemId;
                break;
            case CustomizationType.AvatarFrame:
                user.ActiveAvatarFrameId = itemId;
                break;
            case CustomizationType.Background:
                user.ActiveBackgroundId = itemId;
                break;
        }
        await dbContext.SaveChangesAsync();
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
