namespace StudyTestingSoftware.Models;

public class AnswerOption : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsCorrect { get; set; }

    public required Question Question { get; set; }
    public Guid QuestionId { get; set; }

    public required AnswerRow AnswerRow { get; set; }
    public Guid AnswerRowId { get; set; }
}
