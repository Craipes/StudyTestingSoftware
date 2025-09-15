namespace StudyTestingSoftware;

public static class NameValidationHelper
{
    public static string FormatName(string name)
    {
        return name.Trim();
    }

    public static bool ValidateName(string name, UserDataOptions options)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length < options.MinNameLength || name.Length > options.MaxNameLength)
        {
            return false;
        }
        foreach (char c in name)
        {
            if (!char.IsLetter(c) && c != '-' && c != '\'' && c != ' ')
            {
                return false;
            }
        }
        return true;
    }
}
