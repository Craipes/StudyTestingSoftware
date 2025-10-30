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
        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return [];
        return await dbContext.CustomizationItems
            .AsNoTracking()
            .OrderBy(item => item.Type)
            .ThenByDescending(item => item.UnlockedByDefault)
            .ThenBy(item => item.UnlockedByLevelUp)
            .ThenBy(item => item.Price)
            .Select(item => new CustomizationItemMarketDTO(
                item.CodeId,
                item.Name,
                item.Description,
                item.Type,
                item.ImageUrl,
                item.UnlockedByDefault,
                item.UnlockedByLevelUp,
                item.Price,
                item.LevelRequired,
                dbContext.UserCustomizationItems.Any(uci => uci.UserId == userId && uci.CustomizationItemCodeId == item.CodeId),
                item.CodeId == user.ActiveAvatarCodeId || item.CodeId == user.ActiveAvatarFrameCodeId || item.CodeId == user.ActiveBackgroundCodeId
            ))
            .ToListAsync();
    }

    public async Task<bool> PurchaseCustomizationItem(AppUser user, string itemCodeId)
    {
        var item = await dbContext.CustomizationItems.FindAsync(itemCodeId);
        if (item == null) return false;
        if (item.UnlockedByDefault || item.UnlockedByLevelUp) return false;
        var alreadyOwned = await dbContext.UserCustomizationItems
            .AnyAsync(uci => uci.UserId == user.Id && uci.CustomizationItemCodeId == itemCodeId);
        if (alreadyOwned) return false;
        if (user.Coins < item.Price) return false;
        user.Coins -= item.Price;
        var userItem = new UserCustomizationItem
        {
            User = user,
            CustomizationItem = item,
            CustomizationItemCodeId = item.CodeId,
        };
        dbContext.UserCustomizationItems.Add(userItem);
        CheckUserForEmptyCustomizationInMemory(user, userItem);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task EquipCustomizationItem(AppUser user, string itemCodeId)
    {
        var userItem = await dbContext.UserCustomizationItems
            .Include(uci => uci.CustomizationItem)
            .FirstOrDefaultAsync(uci => uci.UserId == user.Id && uci.CustomizationItemCodeId == itemCodeId);
        if (userItem == null) return;
        switch (userItem.CustomizationItem.Type)
        {
            case CustomizationType.Avatar:
                user.ActiveAvatarCodeId = itemCodeId;
                break;
            case CustomizationType.AvatarFrame:
                user.ActiveAvatarFrameCodeId = itemCodeId;
                break;
            case CustomizationType.Background:
                user.ActiveBackgroundCodeId = itemCodeId;
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
                CustomizationItem = item,
                CustomizationItemCodeId = item.CodeId
            };
            dbContext.UserCustomizationItems.Add(userItem);
            CheckUserForEmptyCustomizationInMemory(user, userItem);
        }
        await dbContext.SaveChangesAsync();
    }

    public async Task GrantCustomizationItemToAllUsersIfPossible(CustomizationItem item, bool saveChanges)
    {
        if (!item.UnlockedByDefault && !item.UnlockedByLevelUp && item.Price > 0) return;

        var usersToGrant = await dbContext.Users
            .Where(u => !item.UnlockedByLevelUp || u.Level >= item.LevelRequired)
            .Where(u => !dbContext.UserCustomizationItems.Any(uci => uci.UserId == u.Id && uci.CustomizationItemCodeId == item.CodeId))
            .ToListAsync();

        foreach (var user in usersToGrant)
        {
            var userItem = new UserCustomizationItem
            {
                User = user,
                CustomizationItem = item,
                CustomizationItemCodeId = item.CodeId
            };
            dbContext.UserCustomizationItems.Add(userItem);
            CheckUserForEmptyCustomizationInMemory(user, userItem);
        }
        if (saveChanges) await dbContext.SaveChangesAsync();
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
                CustomizationItem = item,
                CustomizationItemCodeId = item.CodeId
            };
            dbContext.UserCustomizationItems.Add(userItem);
            CheckUserForEmptyCustomizationInMemory(user, userItem);
        }
        if (saveChanges) await dbContext.SaveChangesAsync();
    }

    private static void CheckUserForEmptyCustomizationInMemory(AppUser user, UserCustomizationItem item)
    {
        if (item.CustomizationItem.Type == CustomizationType.Avatar && user.ActiveAvatarCodeId == null)
        {
            user.ActiveAvatarCodeId = item.CustomizationItemCodeId;
        }
        else if (item.CustomizationItem.Type == CustomizationType.AvatarFrame && user.ActiveAvatarFrameCodeId == null)
        {
            user.ActiveAvatarFrameCodeId = item.CustomizationItemCodeId;
        }
        else if (item.CustomizationItem.Type == CustomizationType.Background && user.ActiveBackgroundCodeId == null)
        {
            user.ActiveBackgroundCodeId = item.CustomizationItemCodeId;
        }
    }
}