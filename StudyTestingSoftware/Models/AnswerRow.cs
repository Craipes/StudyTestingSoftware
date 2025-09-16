namespace StudyTestingSoftware.Models;

public class AnswerRow : BaseEntity
{
    public required string Text { get; set; }
    public int Order { get; set; }

    public required Question Question { get; set; }
    public Guid QuestionId { get; set; }

    public List<AnswerOption> AnswerOptions { get; set; } = [];
}
