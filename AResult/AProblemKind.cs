namespace AResult;

public enum AProblemKind
{
    Validation,
    NotFound,
    Conflict,
    Unauthorized,
    Forbidden,
    Concurrency,
    Internal,
    Unknown
}