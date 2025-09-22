using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
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

    public async Task<UserInfoDTO?> GetInfo(ClaimsPrincipal principal)
    {
        var user = await userManager.GetUserAsync(principal);

        if (user == null)
        {
            return null;
        }

        return await GetInfo(user);
    }

    public async Task<UserInfoDTO?> GetInfo(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return null;
        }
        return await GetInfo(user);
    }

    private async Task<UserInfoDTO> GetInfo(AppUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var userDTO = new UserInfoDTO(
            user.Id,
            user.FirstName,
            user.LastName,
            user.MiddleName,
            roles.Contains(AppRolesConstants.TeacherRole),
            roles.Contains(AppRolesConstants.StudentRole)
        );
        return userDTO;
    }

    public async Task<List<UserInfoDTO>> GetUsersInfoInGroup(Guid groupId)
    {
        var users = await dbContext.StudentGroups
            .Where(g => g.Id == groupId)
            .SelectMany(g => g.Students)
            .ToListAsync();

        var usersInfo = new List<UserInfoDTO>();
        foreach (var user in users)
        {
            var userInfo = await GetInfo(user);
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
