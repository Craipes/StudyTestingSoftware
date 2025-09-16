using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Models;

public class Question : BaseEntity
{
    public required string Text { get; set; }
    public int Order { get; set; }
    [Range(0, 100)] public int Points { get; set; }
    public QuestionType QuestionType { get; set; }
    public bool ShuffleAnswers { get; set; }

    // Slider
    public double MinNumberValue { get; set; }
    public double MaxNumberValue { get; set; }
    [Range(0d, 1000000d)] public double NumberValueStep { get; set; }
    public double TargetNumberValue { get; set; }

    // Check
    public bool TargetBoolValue { get; set; }

    public required Test Test { get; set; }
    public Guid TestId { get; set; }

    public List<AnswerRow> AnswerRows { get; set; } = [];
}
