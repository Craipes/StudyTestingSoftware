namespace AResultLib;

public static class AResults
{
    public static AResult<T> Ok<T>(T value) => AResult<T>.Success(value);
    public static AResult Ok() => AResult.Success();
    public static AResult<T> Fail<T>(params AProblem[] problems) => AResult<T>.Failure(problems);
    public static AResult Fail(params AProblem[] problems) => AResult.Failure(problems);
}