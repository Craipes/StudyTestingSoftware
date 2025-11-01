using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[Route("student/tests")]
[ApiController]
[Authorize]
public class StudentTestsController : ControllerBase
{
    private readonly TestSessionManager testSessionManager;
    private readonly UserManager<AppUser> userManager;

    public StudentTestsController(TestSessionManager testSessionManager, UserManager<AppUser> userManager)
    {
        this.testSessionManager = testSessionManager;
        this.userManager = userManager;
    }

    [HttpGet("list-available-tests")]
    public async Task<ActionResult<StudentTestPreviewPaginationDTO>> ListAvailableTests([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        return await testSessionManager.ListAvailableTestsForStudentAsync(userId, pageSize, page);
    }

    [HttpGet("active-sessions")]
    public async Task<ActionResult<List<StudentActiveTestSessionPreviewDTO>>> ListActiveTestSessions()
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }
        return await testSessionManager.GetActiveStudentTestSessionsAsync(userId);
    }

    [HttpGet("completed-sessions")]
    public async Task<ActionResult<StudentCompletedTestSessionPreviewPaginationDTO>> ListCompletedTestSessions([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        return await testSessionManager.GetCompletedStudentTestSessionsAsync(userId, pageSize, page);
    }

    [HttpPost("start/{testId:guid}")]
    public async Task<ActionResult<Guid?>> StartTestSession(Guid testId)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        var session = (await testSessionManager.StartSessionAsync(testId, userId)).Map<Guid?>(s => s.Id);
        if (!session.IsSuccess)
        {
            return this.ToActionResult(session);
        }
        return session.Value;
    }

    [HttpGet("session/{sessionId:guid}")]
    public async Task<ActionResult<StudentTestSessionDTO>> GetTestSession(Guid sessionId)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        var session = await testSessionManager.GetStudentSessionDTO(sessionId, userId);
        if (!session.IsSuccess)
        {
            return this.ToActionResult(session);
        }

        return session.Value!;
    }

    [HttpPut("session/submit-answer")]
    public async Task<ActionResult> SubmitTestSessionAnswer([FromBody] StudentAnswerSubmitDTO answerDTO)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        var result = await testSessionManager.SubmitAnswerAsync(answerDTO, userId);
        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }

        return Ok();
    }

    [HttpPost("session/{sessionId:guid}/submit")]
    public async Task<ActionResult> SubmitTestSession(Guid sessionId)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }
        var result = await testSessionManager.SubmitSessionByIdAndUserAsync(sessionId, userId);
        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }
        return Ok();
    }
}
