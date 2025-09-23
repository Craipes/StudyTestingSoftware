using Microsoft.AspNetCore.Identity;
using StudyTestingSoftware.DTO.TeacherTest;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize(Roles = AppRolesConstants.TeacherRole)]
[Route("teacher/tests")]
public class TeacherTestsController : Controller
{
    private readonly UserManager<AppUser> userManager;
    private readonly TestManager testManagement;

    public TeacherTestsController(UserManager<AppUser> userManager, TestManager testManagement)
    {
        this.userManager = userManager;
        this.testManagement = testManagement;
    }

    [HttpGet("list-ids")]
    public async Task<ActionResult<List<Guid>>> GetTestIds()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var testIds = await testManagement.ListTestIdsByAuthorAsync(user.Id);

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

        var testsPreviews = await testManagement.ListTeacherTestPreviewsByAuthorAsync(user.Id);
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

        (var test, var testValidation) = await testManagement.TryToCreateTestAsync(data, user);
        ModelState.Merge(testValidation);

        if (!ModelState.IsValid || test == null)
        {
            return BadRequest(ModelState);
        }

        return Ok(test.Id);
    }

    [HttpGet("edit/{id:guid}")]
    public async Task<ActionResult<TeacherTestDTO>> EditTest([FromRoute] Guid id)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var test = await testManagement.LoadTestAsync(id, false);

        if (test == null)
        {
            return NotFound();
        }

        var testDTO = TeacherTestDTO.CreateDTO(test);
        return testDTO;
    }

    [HttpPut("edit/{id:guid}")]
    public async Task<ActionResult<Guid>> EditTest([FromRoute] Guid id, [FromBody] TeacherTestDTO data)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var test = await testManagement.LoadTestDefinitionAsync(id);
        if (test == null)
        {
            return NotFound();
        }

        if (test.AuthorId != user.Id)
        {
            return Forbid();
        }

        var testValidation = await testManagement.TryToUpdateTestAsync(data, id);
        ModelState.Merge(testValidation);
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        return Ok(test.Id);
    }

    [HttpDelete("delete/{id:guid}")]
    public async Task<ActionResult> DeleteTest([FromRoute] Guid id)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var test = await testManagement.LoadTestDefinitionAsync(id);
        if (test == null)
        {
            return NotFound();
        }
        if (test.AuthorId != user.Id)
        {
            return Forbid();
        }

        await testManagement.DeleteTestAsync(id);
        return Ok();
    }
}
