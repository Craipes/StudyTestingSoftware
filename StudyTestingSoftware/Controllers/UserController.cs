using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize]
[Route("user")]
public class UserController : Controller
{
    private readonly UserManager<AppUser> userManager;

    public UserController(UserManager<AppUser> userManager)
    {
        this.userManager = userManager;
    }

    [HttpGet("info")]
    public async Task<ActionResult<UserInfoDTO>> GetInfo([FromQuery] string? userId)
    {
        var user = userId == null 
            ? await userManager.GetUserAsync(User)
            : await userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        var roles = await userManager.GetRolesAsync(user);

        var userDTO = new UserInfoDTO(
            user.FirstName,
            user.LastName,
            user.MiddleName,
            roles.Contains(AppRolesConstants.TeacherRole),
            roles.Contains(AppRolesConstants.StudentRole)
        );

        return userDTO;
    }
}
