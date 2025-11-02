using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace StudyTestingSoftware;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userService = services.GetRequiredService<RoleManager<AppRole>>();
        await SeedRoles(userService);

        var dbContext = services.GetRequiredService<AppDbContext>();
        var customizationManager = services.GetRequiredService<CustomizationManager>();
        var env = services.GetRequiredService<IWebHostEnvironment>();
        await SeedCustomizationItemsAsync(dbContext, customizationManager, env);
    }

    public static async Task SeedRoles(RoleManager<AppRole> roleManager)
    {
        if (!await roleManager.RoleExistsAsync(AppRolesConstants.TeacherRole))
        {
            await roleManager.CreateAsync(new AppRole(AppRolesConstants.TeacherRole));
        }
        if (!await roleManager.RoleExistsAsync(AppRolesConstants.StudentRole))
        {
            await roleManager.CreateAsync(new AppRole(AppRolesConstants.StudentRole));
        }
    }

    public static async Task SeedCustomizationItemsAsync(AppDbContext context, CustomizationManager customizationManager, IWebHostEnvironment env)
    {
        var seedFilePath = Path.Combine(env.ContentRootPath, "customization-seed.json");
        if (!File.Exists(seedFilePath))
        {
            throw new FileNotFoundException("Customization seed file not found.", seedFilePath);
        }

        var json = await File.ReadAllTextAsync(seedFilePath);
        var customizationItems = JsonSerializer.Deserialize<List<CustomizationItem>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var existingItems = await context.CustomizationItems.ToListAsync();
        foreach (var existingItem in existingItems)
        {
            if (customizationItems == null || !customizationItems.Any(c => c.CodeId == existingItem.CodeId))
            {
                // Set active customization items to null for users who have them equipped
                switch (existingItem.Type)
                {
                    case CustomizationType.Avatar:
                        await context.Users
                            .Where(u => u.ActiveAvatarCodeId == existingItem.CodeId)
                            .ExecuteUpdateAsync(s => s.SetProperty(u => u.ActiveAvatarCodeId, (string?)null));
                        break;
                    case CustomizationType.AvatarFrame:
                        await context.Users
                            .Where(u => u.ActiveAvatarFrameCodeId == existingItem.CodeId)
                            .ExecuteUpdateAsync(s => s.SetProperty(u => u.ActiveAvatarFrameCodeId, (string?)null));
                        break;
                    case CustomizationType.Background:
                        await context.Users
                            .Where(u => u.ActiveBackgroundCodeId == existingItem.CodeId)
                            .ExecuteUpdateAsync(s => s.SetProperty(u => u.ActiveBackgroundCodeId, (string?)null));
                        break;
                }

                await context.UserCustomizationItems.Where(uci => uci.CustomizationItemCodeId == existingItem.CodeId).ExecuteDeleteAsync();

                context.CustomizationItems.Remove(existingItem);
            }
        }

        if (customizationItems == null) return;

        foreach (var item in customizationItems)
        {
            var existingItem = await context.CustomizationItems.FirstOrDefaultAsync(ci => ci.CodeId == item.CodeId);
            if (existingItem == null)
            {
                context.CustomizationItems.Add(item);
            }
            else
            {
                existingItem.Name = item.Name;
                existingItem.Description = item.Description;
                existingItem.Type = item.Type;
                existingItem.ImageUrl = item.ImageUrl;
                existingItem.UnlockedByDefault = item.UnlockedByDefault;
                existingItem.UnlockedByLevelUp = item.UnlockedByLevelUp;
                existingItem.Price = item.Price;
                existingItem.LevelRequired = item.LevelRequired;
            }
            await customizationManager.GrantCustomizationItemToAllUsersIfPossible(item, false);
        }
        await context.SaveChangesAsync();
    }
}
