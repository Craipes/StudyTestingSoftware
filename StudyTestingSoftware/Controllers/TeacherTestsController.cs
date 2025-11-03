using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize(Roles = AppRolesConstants.TeacherRole)]
[Route("teacher/tests")]
public class TeacherTestsController : Controller
{
    private readonly UserManager<AppUser> userManager;
    private readonly TestReadManager testReadManager;
    private readonly TestWriteManager testWriteManager;
    private readonly TestSessionManager testSessionManager;

    public TeacherTestsController(UserManager<AppUser> userManager, TestReadManager testReadManager, TestWriteManager testWriteManager, TestSessionManager testSessionManager)
    {
        this.userManager = userManager;
        this.testReadManager = testReadManager;
        this.testWriteManager = testWriteManager;
        this.testSessionManager = testSessionManager;
    }

    [HttpGet("list-ids")]
    public async Task<ActionResult<List<Guid>>> GetTestIds()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var testIds = await testReadManager.ListTestIdsByAuthorAsync(user.Id);

        return testIds;
    }

    [HttpGet("list-previews")]
    public async Task<ActionResult<List<TeacherTestPreviewDTO>>> GetTestPreviews()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var testsPreviews = await testReadManager.ListTeacherTestPreviewsByAuthorAsync(user.Id);
        return testsPreviews;
    }

    [HttpPost("create")]
    public async Task<ActionResult<Guid>> CreateTest([FromBody] TeacherTestDTO data)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = (await testWriteManager.TryToCreateTestAsync(data, user))
            .Map(r => r.Id);

        return this.ToActionResult(result);
    }

    [HttpGet("edit/{id:guid}")]
    public async Task<ActionResult<TeacherTestDTO>> EditTest([FromRoute] Guid id)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var test = await testReadManager.LoadTestAsync(id, false);

        if (test == null)
        {
            return NotFound();
        }

        var testDTO = TeacherTestDTO.CreateDTO(test);
        return testDTO;
    }

    [HttpPut("edit/{id:guid}")]
    public async Task<ActionResult<Guid?>> EditTest([FromRoute] Guid id, [FromBody] TeacherTestDTO data)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var test = await testReadManager.LoadTestDefinitionAsync(id);
        if (test == null)
        {
            return NotFound();
        }

        if (test.AuthorId != user.Id)
        {
            return Forbid();
        }

        var result = (await testWriteManager.TryToUpdateTestAsync(data, id))
            .Map(r => r?.Id);

        return this.ToActionResult(result);
    }

    [HttpDelete("delete/{id:guid}")]
    public async Task<ActionResult> DeleteTest([FromRoute] Guid id)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var test = await testReadManager.LoadTestDefinitionAsync(id);
        if (test == null)
        {
            return NotFound();
        }
        if (test.AuthorId != user.Id)
        {
            return Forbid();
        }

        await testWriteManager.DeleteTestAsync(id);
        return Ok();
    }

    [HttpGet("view/{id:guid}")]
    public async Task<ActionResult<TeacherPaginatedTestViewDTO>> ViewTest([FromRoute] Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var testDTO = await testReadManager.LoadTestViewForTeacherAsync(id, null, user.Id, pageSize, page);

        if (testDTO == null)
        {
            return NotFound();
        }

        return testDTO;
    }

    [HttpGet("view-group/{id:guid}/{groupId:guid}")]
    public async Task<ActionResult<TeacherPaginatedTestViewDTO>> ViewTest([FromRoute] Guid id, [FromRoute] Guid groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var testDTO = await testReadManager.LoadTestViewForTeacherAsync(id, groupId, user.Id, pageSize, page);

        if (testDTO == null)
        {
            return NotFound();
        }

        return testDTO;
    }

    [HttpGet("view/{testId:guid}/{userId:guid}")]
    public async Task<ActionResult<TeacherTestUserSessionsDTO>> ViewTestForStudent([FromRoute] Guid testId, [FromRoute] Guid userId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var testDTO = await testSessionManager.LoadUserSessionsAsync(user, testId, userId);
        if (testDTO == null)
        {
            return NotFound();
        }
        return testDTO;
    }

    [HttpGet("view-session/{sessionId:guid}")]
    public async Task<ActionResult<TeacherTestSessionDTO>> ViewTestSession([FromRoute] Guid sessionId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var dto = await testSessionManager.LoadSessionForTeacherAsync(user, sessionId);
        if (dto == null)
        {
            return NotFound();
        }

        return dto;
    }

    [HttpDelete("delete-session/{sessionId:guid}")]
    public async Task<ActionResult> DeleteTestSession([FromRoute] Guid sessionId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        if (await testSessionManager.DeleteUserSessionAsync(sessionId, user))
        {
            return NoContent();
        }

        return NotFound();
    }
}
