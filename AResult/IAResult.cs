namespace AResultLib;

public interface IAResult
{
    bool IsSuccess { get; }
    IReadOnlyList<AProblem> Problems { get; }
    int GetHttpStatus(int successStatus = 200, int defaultFailureStatus = 400);
}

public interface IAResult<out T> : IAResult
{
    T? Value { get; }
}