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
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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

            foreach (var matrixColumnDTO in questionDTO.QuestionColumns)
            {
                QuestionMatrixColumn matrixColumn = new()
                {
                    Question = question
                };
                matrixColumnDTO.UpdateEntity(matrixColumn);
                dbContext.QuestionMatrixColumns.Add(matrixColumn);
            }

            foreach (var matrixRowDTO in questionDTO.QuestionRows)
            {
                if (matrixRowDTO.ValidColumnOrder < 0 || matrixRowDTO.ValidColumnOrder >= question.QuestionColumns.Count)
                {
                    return BadRequest($"Question (Title: {question.Text}) matrix row has invalid ValidColumnOrder {matrixRowDTO.ValidColumnOrder}.");
                }

                QuestionMatrixColumn answerColumn = question.QuestionColumns[matrixRowDTO.ValidColumnOrder];

                QuestionMatrixRow matrixRow = new()
                {
                    CorrectMatrixColumn = answerColumn,
                    Question = question
                };
                matrixRowDTO.UpdateEntity(matrixRow);
                dbContext.QuestionMatrixRows.Add(matrixRow);
            }

            foreach (var choiceOptionDTO in questionDTO.ChoiceOptions)
            {
                QuestionChoiceOption choiceOption = new()
                {
                    Question = question
                };
                choiceOptionDTO.UpdateEntity(choiceOption);
                dbContext.QuestionChoices.Add(choiceOption);
            }
        }

        var validationResult = ValidateTest(test);

        // Error found
        if (validationResult != null)
        {
            return validationResult;
        }

        await dbContext.SaveChangesAsync();

        return Ok(test.Id);
    }

    private static ActionResult? ValidateTest(Test test)
    {
        foreach (var question in test.Questions)
        {
            if (question.QuestionType == QuestionType.TableSingleChoice || question.QuestionType == QuestionType.Ordering)
            {
                if (question.QuestionRows.Count == 0)
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) is of type {question.QuestionType} but has no rows.");
                }
                if (question.QuestionColumns.Count == 0)
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) is of type {question.QuestionType} but has no columns.");
                }
                foreach (var row in question.QuestionRows)
                {
                    if (row.CorrectMatrixColumn == null)
                    {
                        return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) has a row {row.Id} with no correct column.");
                    }
                    if (!question.QuestionColumns.Contains(row.CorrectMatrixColumn))
                    {
                        return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) has a row {row.Id} with a correct column that does not belong to the question.");
                    }
                }

                if (question.QuestionRows.DistinctBy(q => q.Order).Count() != question.QuestionRows.Count)
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) has duplicate rows.");
                }
                if (question.QuestionColumns.DistinctBy(q => q.Order).Count() != question.QuestionColumns.Count)
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) has duplicate columns.");
                }
            }
            else if (question.QuestionType == QuestionType.MultipleChoice || question.QuestionType == QuestionType.SingleChoice)
            {
                if (question.ChoiceOptions.Count == 0)
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) is of type {question.QuestionType} but has no choice options.");
                }
                if (!question.ChoiceOptions.Any(co => co.IsCorrect))
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) is of type {question.QuestionType} but has no correct choice option.");
                }
                if (question.ChoiceOptions.DistinctBy(co => co.Order).Count() != question.ChoiceOptions.Count)
                {
                    return new BadRequestObjectResult($"Question {question.Id} (Title: {question.Text}) has duplicate choice options.");
                }
            }
        }
        return null;
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
