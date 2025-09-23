using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize]
[Route("user")]
public class UserController : Controller
{
    private readonly AppDbContext dbContext;
    private readonly UserManager<AppUser> userManager;
    private readonly CustomUserManager customUserManager;

    public UserController(AppDbContext dbContext, UserManager<AppUser> userManager, CustomUserManager customUserManager)
    {
        this.dbContext = dbContext;
        this.userManager = userManager;
        this.customUserManager = customUserManager;
    }

    [HttpGet("info")]
    public async Task<ActionResult<UserInfoDTO>> GetInfo([FromQuery] Guid? userId)
    {
        var user = userId == null 
            ? await customUserManager.GetInfo(User)
            : await customUserManager.GetInfo(userId.Value);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("find-users")]
    public async Task<ActionResult<IEnumerable<SearchUserInfoDTO>>> FindUsers([FromQuery] string emailPrefix)
    {
        const int minSearchLength = 2;
        if (string.IsNullOrWhiteSpace(emailPrefix) || emailPrefix.Length < minSearchLength)
        {
            return BadRequest($"At least {minSearchLength} characters are required.");
        }

        return Ok(await customUserManager.SearchUsersByEmailPrefixAsync(emailPrefix));
    }
}
