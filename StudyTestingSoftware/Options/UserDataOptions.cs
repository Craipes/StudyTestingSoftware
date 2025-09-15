namespace StudyTestingSoftware.Options;

public class UserDataOptions
{
    // Password
    public int MinPasswordLength { get; set; } = 8;
    public int MaxPasswordLength { get; set; } = 80;

    // Name
    public int MinNameLength { get; set; } = 2;
    public int MaxNameLength { get; set; } = 50;
}
