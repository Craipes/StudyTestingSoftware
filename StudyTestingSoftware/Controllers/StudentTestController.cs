using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[Route("student/tests")]
[ApiController]
[Authorize]
public class StudentTestController : ControllerBase
{
    private readonly TestSessionManager testSessionManager;
    private readonly UserManager<AppUser> userManager;

    public StudentTestController(TestSessionManager testSessionManager, UserManager<AppUser> userManager)
    {
        this.testSessionManager = testSessionManager;
        this.userManager = userManager;
    }

    [HttpGet("list-available-tests/{page:int}")]
    public async Task<ActionResult<List<StudentTestPreviewDTO>>> ListAvailableTests(int page = 1)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        const int pageSize = 10;
        if (page < 1) page = 1;
        return await testSessionManager.ListAvailableTestsForStudentAsync(userId, pageSize, page - 1);
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

    [HttpGet("completed-sessions/{page:int}")]
    public async Task<ActionResult<List<StudentCompletedTestSessionPreviewDTO>>> ListCompletedTestSessions(int page = 1)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }
        const int pageSize = 10;
        if (page < 1) page = 1;
        return await testSessionManager.GetCompletedStudentTestSessionsAsync(userId, pageSize, page - 1);
    }

    [HttpPost("start/{testId:guid}")]
    public async Task<ActionResult<Guid?>> StartTestSession(Guid testId)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        var session = await testSessionManager.StartSessionAsync(testId, userId);
        if (session == null)
        {
            return BadRequest("Cannot start test session. Possible reasons: test not found, not opened, not published, access denied.");
        }
        return session.Id;
    }

    [HttpGet("session/{sessionId:guid}")]
    public async Task<ActionResult<StudentTestSessionDTO>> GetTestSession(Guid sessionId)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        var session = await testSessionManager.GetStudentSessionDTO(sessionId, userId);
        if (session == null)
        {
            return NotFound("Test session not found or access denied.");
        }

        return session;
    }

    [HttpPut("session/submit-answer")]
    public async Task<ActionResult> SubmitTestSessionAnswer([FromBody] StudentAnswerSubmitDTO answerDTO)
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }

        var result = await testSessionManager.SubmitAnswerAsync(answerDTO, userId);
        if (!result)
        {
            return BadRequest("Cannot submit answer. Possible reasons: session not found, access denied, already finalized.");
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
        if (!result)
        {
            return BadRequest("Cannot finalize test session. Possible reasons: session not found, access denied, already finalized.");
        }
        return Ok();
    }
}
