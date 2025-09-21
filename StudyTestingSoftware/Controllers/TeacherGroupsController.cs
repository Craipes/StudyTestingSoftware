using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize(Roles = AppRolesConstants.TeacherRole)]
[Route("teacher/groups")]
public class TeacherGroupsController : Controller
{
    private readonly UserManager<AppUser> userManager;
    private readonly GroupManager groupManager;

    public TeacherGroupsController(UserManager<AppUser> userManager, GroupManager groupManager)
    {
        this.userManager = userManager;
        this.groupManager = groupManager;
    }

    [HttpGet("list-ids")]
    public async Task<ActionResult<List<Guid>>> GetGroupIds()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var groupIds = await groupManager.ListGroupIdsByAuthorAsync(user.Id);
        return groupIds;
    }

    [HttpPost("create")]
    public async Task<ActionResult<Guid>> CreateGroup([FromBody] TeacherGroupDTO data)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var group = await groupManager.CreateGroupAsync(user, data);
        return group.Id;
    }

    [HttpGet("edit/{groupId:guid}")]
    public async Task<ActionResult<TeacherGroupDTO>> EditGroup([FromRoute] Guid groupId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var group = await groupManager.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound();
        }

        if (group.OwnerId != user.Id)
        {
            return Forbid();
        }

        return new TeacherGroupDTO(group.Id, group.Name, group.Description);
    }

    [HttpPut("edit/{groupId:guid}")]
    public async Task<ActionResult> EditGroup([FromRoute] Guid groupId, [FromBody] TeacherGroupDTO data)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var group = await groupManager.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound();
        }
        if (group.OwnerId != user.Id)
        {
            return Forbid();
        }

        await groupManager.UpdateGroupAsync(group, data);
        return Ok();
    }

    [HttpDelete("delete/{groupId:guid}")]
    public async Task<ActionResult> DeleteGroup([FromRoute] Guid groupId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var group = await groupManager.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return NotFound();
        }

        if (group.OwnerId != user.Id)
        {
            return Forbid();
        }

        await groupManager.DeleteGroupAsync(groupId);
        return Ok();
    }
}
