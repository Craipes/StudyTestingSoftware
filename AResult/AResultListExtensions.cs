namespace AResult;

public static class AResultListExtensions
{
    // Aggregate a list of results into one result of list
    public static AResult<List<T>> Aggregate<T>(this IEnumerable<AResult<T>> results)
    {
        var materialized = results.ToList();
        var problems = materialized.SelectMany(r => r.Problems).ToList();
        if (problems.Count > 0)
            return AResult<List<T>>.Failure(problems);
        return AResult<List<T>>.Success(materialized.Select(r => r.Value!).ToList());
    }
}