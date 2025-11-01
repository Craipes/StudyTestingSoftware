namespace StudyTestingSoftware.Models.TestSessions;

public class TestSession : BaseEntity
{
    public required Test Test { get; set; }
    public Guid TestId { get; set; }
    public required AppUser User { get; set; }
    public Guid UserId { get; set; }

    public required int RandomSeed { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; } = null;
    public DateTime? AutoFinishAt { get; set; } = null;

    public double Score { get; set; } = 0d;
    public bool IsCompleted { get; set; } = false;

    public List<TestUserAnswer> UserAnswers { get; set; } = [];
}
