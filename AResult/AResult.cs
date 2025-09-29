using System.Diagnostics.CodeAnalysis;

namespace AResult;

public class AResult<T> : IAResult<T>
{
    private readonly List<AProblem> _problems = [];

    public T? Value { get; private init; }
    public IReadOnlyList<AProblem> Problems => _problems;
    public bool IsSuccess => _problems.Count == 0;

    public AResult() { }

    private AResult(T value)
    {
        Value = value;
    }

    private AResult(IEnumerable<AProblem> problems)
    {
        _problems.AddRange(problems);
    }

    public static AResult<T> Success(T value) => new(value);

    public static AResult<T> Failure(params AProblem[] problems) => new(problems);

    public static AResult<T> Failure(IEnumerable<AProblem> problems) => new(problems);

    public AResult<T> AddProblem(AProblem problem)
    {
        _problems.Add(problem);
        return this;
    }

    public AResult<T> AddProblems(IEnumerable<AProblem> problems, string? pathPrefix = null)
    {
        if (!string.IsNullOrWhiteSpace(pathPrefix))
            _problems.AddRange(problems.Select(p => p.WithPathPrefix(pathPrefix)));
        else
            _problems.AddRange(problems);
        return this;
    }

    public AResult<TOut> Map<TOut>(Func<T, TOut> mapper)
    {
        if (!IsSuccess)
            return AResult<TOut>.Failure(Problems);
        return AResult<TOut>.Success(mapper(Value!));
    }

    public AResult<TOut> Bind<TOut>(Func<T, AResult<TOut>> binder)
    {
        if (!IsSuccess)
            return AResult<TOut>.Failure(Problems);
        return binder(Value!);
    }

    public AResult<T> Ensure(Func<T, bool> predicate, AProblem problem)
    {
        if (IsSuccess && !predicate(Value!))
            _problems.Add(problem);
        return this;
    }

    public AResult<T> Scope(string pathPrefix, string separator = ".")
    {
        if (IsSuccess) return this;
        var scoped = _problems.Select(p => p.WithPathPrefix(pathPrefix, separator)).ToList();
        _problems.Clear();
        _problems.AddRange(scoped);
        return this;
    }

    public AResult<T> Merge<TMerge>(AResult<TMerge> other, string? pathPrefix = null)
    {
        if (other.IsSuccess) return this;
        AddProblems(other.Problems, pathPrefix);
        return this;
    }

    public int GetHttpStatus(int successStatus = 200, int defaultFailureStatus = 400)
    {
        if (IsSuccess) return successStatus;
        return Problems.FirstOrDefault(p => p.HttpStatus.HasValue)?.HttpStatus ?? defaultFailureStatus;
    }

    public bool TryGetValue([MaybeNullWhen(false)] out T value)
    {
        value = Value!;
        return IsSuccess;
    }

    public static implicit operator AResult<T>(T value) => Success(value);
}

public sealed class AResult : AResult<Unit>
{
    private AResult() { }
    private AResult(IEnumerable<AProblem> problems) => AddProblems(problems);

    public static AResult Success() => new();
    public static new AResult Failure(params AProblem[] problems) => new AResult(problems);
    public static new AResult Failure(IEnumerable<AProblem> problems) => new AResult(problems);

    public static implicit operator AResult(Unit _) => Success();
}

public readonly struct Unit
{
    public static readonly Unit Value = new();
}
