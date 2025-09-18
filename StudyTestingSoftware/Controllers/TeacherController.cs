using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize(Roles = AppRolesConstants.TeacherRole)]
[Route("teacher")]
public class TeacherController : Controller
{
    private readonly UserManager<AppUser> userManager;
    private readonly AppDbContext dbContext;
    private readonly TestManagement testManagement;

    public TeacherController(UserManager<AppUser> userManager, AppDbContext dbContext, TestManagement testManagement)
    {
        this.userManager = userManager;
        this.dbContext = dbContext;
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

        var testIds = await dbContext.Tests
            .Where(t => t.AuthorId == user.Id)
            .Select(t => t.Id)
            .ToListAsync();

        return testIds;
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

        var test = await dbContext.Tests
            .Where(t => t.Id == id)
            .Include(t => t.Questions)
                .ThenInclude(q => q.QuestionRows)
                    .ThenInclude(r => r.CorrectMatrixColumn)
            .Include(t => t.Questions)
                .ThenInclude(q => q.QuestionColumns)
            .Include(t => t.Questions)
                .ThenInclude(q => q.ChoiceOptions)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (test == null)
        {
            return NotFound();
        }

        var testDTO = TeacherTestDTO.CreateDTO(test);
        return testDTO;
    }
}
