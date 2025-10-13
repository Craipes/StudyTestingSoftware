using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize(Roles = AppRolesConstants.TeacherRole)]
[Route("teacher/groups")]
public class TeacherGroupsController : Controller
{
    private readonly UserManager<AppUser> userManager;
    private readonly GroupManager groupManager;
    private readonly TestReadManager testReadManager;
    private readonly CustomUserManager customUserManager;

    public TeacherGroupsController(UserManager<AppUser> userManager, GroupManager groupManager, TestReadManager testReadManager, CustomUserManager customUserManager)
    {
        this.userManager = userManager;
        this.groupManager = groupManager;
        this.testReadManager = testReadManager;
        this.customUserManager = customUserManager;
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
                return this.ToActionResult(AResult.Failure(AProblem.Validation(GeneralErrors.EmailRequired)));
            }
            return await groupManager.AddUserToGroupByEmailAsync(groupId, userEmail);
        }
        else
        {
            if (userId == null || userId == Guid.Empty)
            {
                return this.ToActionResult(AResult.Failure(AProblem.Validation(GeneralErrors.IdRequired)));
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
                return this.ToActionResult(AResult.Failure(AProblem.Validation(GeneralErrors.EmailRequired)));
            }
            return await groupManager.RemoveUserFromGroupByEmailAsync(groupId, userEmail);
        }
        else
        {
            if (userId == null || userId == Guid.Empty)
            {
                return this.ToActionResult(AResult.Failure(AProblem.Validation(GeneralErrors.IdRequired)));
            }
            return await groupManager.RemoveUserFromGroupByIdAsync(groupId, userId.Value);
        }
    }

    [HttpPost("add-test/{groupId:guid}")]
    public async Task<ActionResult> AddTest([FromRoute] Guid groupId, [FromQuery, Required] Guid testId)
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

        var test = await testReadManager.LoadTestDefinitionAsync(testId);
        if (test == null)
        {
            return NotFound();
        }
        if (test.AuthorId != user.Id)
        {
            return Forbid();
        }

        return await groupManager.AddTestToGroupAsync(groupId, testId);
    }

    [HttpDelete("remove-test/{groupId:guid}")]
    public async Task<ActionResult> RemoveTest([FromRoute] Guid groupId, [FromQuery, Required] Guid testId)
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

        var test = await testReadManager.LoadTestDefinitionAsync(testId);
        if (test == null)
        {
            return NotFound();
        }
        if (test.AuthorId != user.Id)
        {
            return Forbid();
        }

        return await groupManager.RemoveTestFromGroupAsync(groupId, testId);
    }

    [HttpGet("list-tests/{groupId:guid}")]
    public async Task<ActionResult<List<TeacherTestPreviewDTO>>> ListGroupTests([FromRoute] Guid groupId)
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
        var tests = await testReadManager.ListTeacherTestPreviewsByGroupAsync(groupId, user.Id);
        return tests;
    }

    [HttpGet("list-students/{groupId:guid}")]
    public async Task<ActionResult<List<FullUserInfoDTO>>> ListGroupStudents([FromRoute] Guid groupId)
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

        var students = await customUserManager.GetUsersInfoInGroupAsync(groupId);
        return Ok(students);
    }
}
