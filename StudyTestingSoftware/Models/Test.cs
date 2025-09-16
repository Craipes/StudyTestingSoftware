using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Models;

public class Test : BaseEntity
{
    [MinLength(1), MaxLength(128)] public string Name { get; set; } = string.Empty;
    [MaxLength(4096)] public string? Description { get; set; }
    [Range(0, 100000)] public int MaxExperience { get; set; }
    public TestAccessMode AccessMode { get; set; } = TestAccessMode.Private;
    [Range(0, 360)] public int DurationInMinutes { get; set; } = 0; // 0 means no time limit
    public bool ShuffleQuestions { get; set; } = false;
    public bool IsPublished { get; set; } = false;

    public required AppUser? Author { get; set; }
    public Guid? AuthorId { get; set; }

    public List<Question> Questions { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
