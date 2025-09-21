using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize(Roles = AppRolesConstants.TeacherRole)]
[Route("teacher")]
public class TeacherController : Controller
{
    private readonly UserManager<AppUser> userManager;
    private readonly TestManager testManagement;

    public TeacherController(UserManager<AppUser> userManager, TestManager testManagement)
    {
        this.userManager = userManager;
        this.testManagement = testManagement;
    }

    [HttpGet("tests/list-ids")]
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

    [HttpGet("tests/list-previews")]
    public async Task<ActionResult<List<TeacherTestPreviewDTO>>> GetTestPreviews()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var testsPreviews = await testManagement.ListTestPreviewsByAuthorAsync(user.Id);
        return testsPreviews;
    }

    [HttpPost("tests/create")]
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

    [HttpGet("tests/edit/{id:guid}")]
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

    [HttpPost("tests/edit/{id:guid}")]
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

    [HttpDelete("tests/delete/{id:guid}")]
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
