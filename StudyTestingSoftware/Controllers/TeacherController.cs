using Microsoft.AspNetCore.Mvc;

namespace StudyTestingSoftware.Controllers;

[ApiController]
[Authorize]
[Route("teacher")]
public class TeacherController : Controller
{
    [HttpGet("test")]
    public ActionResult<TeacherTestDTO> GetTest()
    {
        return View(null);
    }
}
