using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Models.Tests;

public class Question : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    [Range(0, 100)] public int Points { get; set; }
    public QuestionType QuestionType { get; set; }

    // Slider
    public double MinNumberValue { get; set; }
    public double MaxNumberValue { get; set; }
    [Range(0d, 1000000d)] public double NumberValueStep { get; set; }
    public double TargetNumberValue { get; set; }

    // Check
    public bool TargetBoolValue { get; set; }

    public required Test Test { get; set; }
    public Guid TestId { get; set; }

    // Single choice / Multiple choice
    public List<QuestionChoiceOption> ChoiceOptions { get; set; } = [];

    // Table choice / Ordering
    public List<QuestionMatrixRow> QuestionRows { get; set; } = [];
    public List<QuestionMatrixColumn> QuestionColumns { get; set; } = [];
}
