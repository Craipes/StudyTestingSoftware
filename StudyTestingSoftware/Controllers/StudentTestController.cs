using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[Route("student/tests")]
[ApiController]
[Authorize]
public class StudentTestController : ControllerBase
{
    private readonly TestSessionManager testSessionManager;
    private readonly UserManager<AppUser> userManager;

    public StudentTestController(TestSessionManager testSessionManager, UserManager<AppUser> userManager)
    {
        this.testSessionManager = testSessionManager;
        this.userManager = userManager;
    }

    [HttpGet("list-available/{page:int}")]
    public async Task<ActionResult<List<StudentTestPreviewDTO>>> ListAvailableTests(int page = 1)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        const int pageSize = 10;
        if (page < 1) page = 1;
        return await testSessionManager.ListAvailableTestsForStudentAsync(userId, pageSize, page - 1);
    }
}
