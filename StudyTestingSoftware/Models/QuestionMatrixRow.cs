namespace StudyTestingSoftware.Models;

public class QuestionMatrixRow : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }

    public required Question Question { get; set; }
    public Guid QuestionId { get; set; }

    public Guid CorrectMatrixColumnId { get; set; }
    public required QuestionMatrixColumn CorrectMatrixColumn { get; set; }
}
