namespace StudyTestingSoftware;

public static class ListShuffleExtensions
{
    public static void Shuffle<T>(this IList<T> list, Random random)
    {
        int n = list.Count;
        while (n > 1)
        {
            int k = random.Next(n--);
            (list[n], list[k]) = (list[k], list[n]);
        }
    }
}
