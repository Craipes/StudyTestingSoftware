namespace StudyTestingSoftware.Models;

public class AnswerRow : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }

    public required Question Question { get; set; }
    public Guid QuestionId { get; set; }

    public List<AnswerOption> AnswerOptions { get; set; } = [];
}
