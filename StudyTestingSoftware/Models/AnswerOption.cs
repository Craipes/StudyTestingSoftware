namespace StudyTestingSoftware.Models;

public class AnswerOption : BaseEntity
{
    public required string Text { get; set; }
    public int Order { get; set; }
    public bool IsCorrect { get; set; }

    public required Question Question { get; set; }
    public Guid QuestionId { get; set; }

    public required AnswerRow AnswerRow { get; set; }
    public Guid AnswerRowId { get; set; }
}
