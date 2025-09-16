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

    public TeacherController(UserManager<AppUser> userManager, AppDbContext dbContext)
    {
        this.userManager = userManager;
        this.dbContext = dbContext;
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

        Test test = new()
        {
            Author = user
        };
        data.UpdateEntity(test);
        dbContext.Tests.Add(test);

        foreach (var questionDTO in data.Questions)
        {
            Question question = new()
            {
                Test = test
            };
            questionDTO.UpdateEntity(question);
            dbContext.Questions.Add(question);

            foreach (var answerRowDTO in questionDTO.AnswerRows)
            {
                AnswerRow answerRow = new()
                {
                    Question = question
                };
                answerRowDTO.UpdateEntity(answerRow);
                dbContext.AnswerRows.Add(answerRow);

                foreach (var answerOptionDTO in answerRowDTO.AnswerOptions)
                {
                    AnswerOption answerOption = new()
                    {
                        AnswerRow = answerRow,
                        Question = question
                    };
                    answerOptionDTO.UpdateEntity(answerOption);
                    dbContext.AnswerOptions.Add(answerOption);
                }
            }
        }

        await dbContext.SaveChangesAsync();

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
                .ThenInclude(q => q.AnswerRows)
                    .ThenInclude(ar => ar.AnswerOptions)
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
