using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userService = services.GetRequiredService<RoleManager<IdentityRole>>();

        if (!await userService.RoleExistsAsync(AppRolesConstants.TeacherRole))
        {
            await userService.CreateAsync(new IdentityRole(AppRolesConstants.TeacherRole));
        }

        if (!await userService.RoleExistsAsync(AppRolesConstants.StudentRole))
        {
            await userService.CreateAsync(new IdentityRole(AppRolesConstants.StudentRole));
        }
    }
}
