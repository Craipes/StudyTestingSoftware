using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace StudyTestingSoftware.Services;

public class CustomUserManager
{
    private readonly AppDbContext dbContext;
    private readonly UserManager<AppUser> userManager;

    public CustomUserManager(AppDbContext dbContext, UserManager<AppUser> userManager)
    {
        this.dbContext = dbContext;
        this.userManager = userManager;
    }

    public async Task<FullUserInfoDTO?> GetInfoAsync(ClaimsPrincipal principal, bool includeCoins)
    {
        if (!Guid.TryParse(userManager.GetUserId(principal), out var id)) return null;

        var user = await dbContext.Users
            .Include(u => u.ActiveAvatar)
            .Include(u => u.ActiveAvatarFrame)
            .Include(u => u.ActiveBackground)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return null;
        }

        return await GetInfoAsync(user, includeCoins);
    }

    public async Task<FullUserInfoDTO?> GetInfoAsync(Guid userId, bool includeCoins)
    {
        var user = await dbContext.Users
            .Include(u => u.ActiveAvatar)
            .Include(u => u.ActiveAvatarFrame)
            .Include(u => u.ActiveBackground)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return null;
        }
        return await GetInfoAsync(user, includeCoins);
    }

    private async Task<FullUserInfoDTO> GetInfoAsync(AppUser user, bool includeCoins)
    {
        var roles = await userManager.GetRolesAsync(user);
        var userDTO = new FullUserInfoDTO(
            user.Id,
            user.FirstName,
            user.LastName,
            user.MiddleName,
            user.Level,
            user.Experience,
            user.RequiredExperience,
            user.ActiveAvatar?.ImageUrl,
            user.ActiveAvatarFrame?.ImageUrl,
            user.ActiveBackground?.ImageUrl,
            roles.Contains(AppRolesConstants.TeacherRole),
            roles.Contains(AppRolesConstants.StudentRole),
            includeCoins ? user.Coins : 0
        );
        return userDTO;
    }

    public async Task<FullUserInfoDTO?> GetGroupOwnerInfoAsync(Guid groupId)
    {
        var owner = await dbContext.Users
            .Include(u => u.ActiveAvatar)
            .Include(u => u.ActiveAvatarFrame)
            .Include(u => u.ActiveBackground)
            .FirstOrDefaultAsync(u => u.OwnedStudentGroups.Any(g => g.Id == groupId));

        if (owner == null)
        {
            return null;
        }
        return await GetInfoAsync(owner, false);
    }

    public async Task<List<FullUserInfoDTO>> GetUsersInfoInGroupAsync(Guid groupId)
    {
        var users = await dbContext.StudentGroups
            .Where(g => g.Id == groupId)
            .SelectMany(g => g.Students)
            .Include(u => u.ActiveAvatar)
            .Include(u => u.ActiveAvatarFrame)
            .Include(u => u.ActiveBackground)
            .ToListAsync();

        var usersInfo = new List<FullUserInfoDTO>();
        foreach (var user in users)
        {
            var userInfo = await GetInfoAsync(user, false);
            usersInfo.Add(userInfo);
        }
        return usersInfo;
    }

    public async Task<List<SearchUserInfoDTO>> SearchUsersByEmailPrefixAsync(string emailPrefix)
    {
        string normalizedEmailPrefix = emailPrefix.ToUpperInvariant();
        var users = await dbContext.Users
            .Where(u => u.NormalizedEmail != null && u.NormalizedEmail.StartsWith(normalizedEmailPrefix))
            .Select(u => new SearchUserInfoDTO(u.Email!, u.FirstName, u.LastName, u.MiddleName))
            .Take(10)
            .ToListAsync();

        return users;
    }
}
