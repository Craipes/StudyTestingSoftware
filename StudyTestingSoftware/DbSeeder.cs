using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userService = services.GetRequiredService<RoleManager<AppRole>>();

        if (!await userService.RoleExistsAsync(AppRolesConstants.TeacherRole))
        {
            await userService.CreateAsync(new AppRole(AppRolesConstants.TeacherRole));
        }

        if (!await userService.RoleExistsAsync(AppRolesConstants.StudentRole))
        {
            await userService.CreateAsync(new AppRole(AppRolesConstants.StudentRole));
        }
    }
}
