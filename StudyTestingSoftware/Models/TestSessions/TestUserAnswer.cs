namespace StudyTestingSoftware.Models.TestSessions;

public class TestUserAnswer : BaseEntity
{
    public required TestSession TestSession { get; set; }
    public Guid TestSessionId { get; set; }
    public required Question Question { get; set; }
    public Guid QuestionId { get; set; }

    // Choice option for Single choice and Multiple choice questions
    public QuestionChoiceOption? SelectedChoiceOption { get; set; } = null;
    public Guid? SelectedChoiceOptionId { get; set; } = null;

    // Matrix row and column for Table choice and Ordering questions
    public QuestionMatrixRow? SelectedMatrixRow { get; set; } = null;
    public Guid? SelectedMatrixRowId { get; set; } = null;
    public QuestionMatrixColumn? SelectedMatrixColumn { get; set; } = null;
    public Guid? SelectedMatrixColumnId { get; set; } = null;

    // Direct answer for Slider and Check questions
    public double? NumberValue { get; set; } = null;
    public bool? BoolValue { get; set; } = null;

    public bool IsCorrect { get; set; }
}
