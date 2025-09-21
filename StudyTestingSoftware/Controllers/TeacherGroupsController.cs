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

    [HttpGet("list-previews")]
    public async Task<ActionResult<List<TeacherGroupPreviewDTO>>> GetGroupPreviews()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var groupPreviews = await groupManager.GetAuthorPreviews(user.Id);
        return groupPreviews;
    }

    [HttpPost("create")]
    public async Task<ActionResult<Guid>> CreateGroup([FromBody] TeacherGroupDTO data)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

    [HttpPost("add-student/{groupId:guid}")]
    public async Task<ActionResult> AddStudent([FromRoute] Guid groupId, [FromQuery] bool useEmail, [FromQuery] Guid? userId, [FromQuery] string? userEmail)
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

        if (useEmail)
        {
            if (string.IsNullOrWhiteSpace(userEmail))
            {
                return BadRequest("User email must be provided when useEmail is true.");
            }
            return await groupManager.AddUserToGroupByEmailAsync(groupId, userEmail);
        }
        else
        {
            if (userId == null || userId == Guid.Empty)
            {
                return BadRequest("User ID must be provided when useEmail is false.");
            }
            return await groupManager.AddUserToGroupByIdAsync(groupId, userId.Value);
        }
    }

    [HttpDelete("remove-student/{groupId:guid}")]
    public async Task<ActionResult> RemoveStudent([FromRoute] Guid groupId, [FromQuery] bool useEmail, [FromQuery] Guid? userId, [FromQuery] string? userEmail)
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
        
        if (useEmail)
        {
            if (string.IsNullOrWhiteSpace(userEmail))
            {
                return BadRequest("User email must be provided when useEmail is true.");
            }
            return await groupManager.RemoveUserFromGroupByEmailAsync(groupId, userEmail);
        }
        else
        {
            if (userId == null || userId == Guid.Empty)
            {
                return BadRequest("User ID must be provided when useEmail is false.");
            }
            return await groupManager.RemoveUserFromGroupByIdAsync(groupId, userId.Value);
        }
    }
}
