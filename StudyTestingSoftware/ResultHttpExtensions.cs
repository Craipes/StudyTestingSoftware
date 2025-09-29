namespace StudyTestingSoftware;

public static class ResultHttpExtensions
{
    public static ActionResult<T> ToActionResult<T>(this ControllerBase controller, AResult<T> result, int successStatus = 200)
    {
        if (result.IsSuccess)
            return controller.StatusCode(successStatus, result.Value);

        var status = result.GetHttpStatus(successStatus: successStatus);
        var problem = new ProblemDetails
        {
            Status = status,
            Title = "Request failed",
            Detail = result.Problems.FirstOrDefault()?.Message,
            Extensions =
            {
                ["errors"] = result.Problems.Select(p => new {
                    p.Code,
                    p.Message,
                    p.Path,
                    p.HttpStatus,
                    Kind = p.Kind.ToString()
                }).ToList()
            }
        };
        return controller.StatusCode(status, problem);
    }

    public static ActionResult ToActionResult(this ControllerBase controller, AResult result, int successStatus = 204)
    {
        if (result.IsSuccess)
            return controller.StatusCode(successStatus);

        var status = result.GetHttpStatus(successStatus: successStatus);
        var problem = new ProblemDetails
        {
            Status = status,
            Title = "Request failed",
            Detail = result.Problems.FirstOrDefault()?.Message,
            Extensions =
            {
                ["errors"] = result.Problems.Select(p => new {
                    p.Code,
                    p.Message,
                    p.Path,
                    p.HttpStatus,
                    Kind = p.Kind.ToString()
                }).ToList()
            }
        };
        return controller.StatusCode(status, problem);
    }
}