namespace AResultLib;

public sealed record AProblem(
    string Code,
    string Message = "",
    string Path = "",
    int? HttpStatus = null,
    AProblemKind Kind = AProblemKind.Unknown)
{
    public AProblem WithPathPrefix(string prefix, string separator = ".")
    {
        if (string.IsNullOrWhiteSpace(prefix))
            return this;
        var newPath = string.IsNullOrWhiteSpace(Path) ? prefix : $"{prefix}{separator}{Path}";
        return this with { Path = newPath };
    }

    public static AProblem Validation(string code, string message = "", string path = "")
        => new(code, message, path, 400, AProblemKind.Validation);

    public static AProblem NotFound(string code, string message = "", string path = "")
        => new(code, message, path, 404, AProblemKind.NotFound);

    public static AProblem Conflict(string code, string message = "", string path = "")
        => new(code, message, path, 409, AProblemKind.Conflict);

    public static AProblem Unauthorized(string code, string message = "Unauthorized")
        => new(code, message, "", 401, AProblemKind.Unauthorized);

    public static AProblem Forbidden(string code, string message = "Forbidden")
        => new(code, message, "", 403, AProblemKind.Forbidden);

    public static AProblem Internal(string code, string message = "Internal error")
        => new(code, message, "", 500, AProblemKind.Internal);
}
