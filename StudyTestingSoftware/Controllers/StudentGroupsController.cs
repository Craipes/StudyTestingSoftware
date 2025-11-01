using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[Route("student/groups")]
[ApiController]
[Authorize]
public class StudentGroupsController : ControllerBase
{
    private readonly TestSessionManager testSessionManager;
    private readonly UserManager<AppUser> userManager;
    private readonly GroupManager groupManager;
    private readonly CustomUserManager customUserManager;

    public StudentGroupsController(TestSessionManager testSessionManager, UserManager<AppUser> userManager, GroupManager groupManager, CustomUserManager customUserManager)
    {
        this.testSessionManager = testSessionManager;
        this.userManager = userManager;
        this.groupManager = groupManager;
        this.customUserManager = customUserManager;
    }

    [HttpGet("list-ids")]
    public async Task<ActionResult<List<Guid>>> ListGroupsIds()
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }
        var groupsIds = await groupManager.ListGroupsIdsForStudentAsync(userId);
        return groupsIds;
    }

    [HttpGet("list-previews")]
    public async Task<ActionResult<List<StudentGroupPreviewDTO>>> ListGroupsPreviews()
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }
        var groups = await groupManager.GetStudentPreviews(userId);
        return groups;
    }

    [HttpGet("{groupId:guid}")]
    public async Task<ActionResult<StudentGroupFullDTO>> GetGroup(Guid groupId)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        if (!await groupManager.IsInGroupAsync(groupId, userId))
        {
            return Forbid();
        }

        var groupInfo = await groupManager.GetGroupByIdAsync(groupId);
        if (groupInfo == null)
        {
            return NotFound();
        }

        var groupTests = await testSessionManager.ListAvailableGroupTestsForStudentAsync(groupId, userId);
        var groupStudents = await customUserManager.GetUsersInfoInGroupAsync(groupId);
        var author = await customUserManager.GetGroupOwnerInfoAsync(groupId);

        return new StudentGroupFullDTO(
            groupInfo.Id,
            groupInfo.Name,
            groupInfo.Description,
            author,
            groupStudents,
            groupTests);
    }
}
