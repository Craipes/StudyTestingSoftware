using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO;

public record QuestionTeacherDTO
(
    string Text,
    int Order,
    [Range(0, 100)] int Points,
    QuestionType QuestionType,
    bool ShuffleAnswers,

    // Slider
    double MinNumberValue,
    double MaxNumberValue,
    [Range(0d, 1000000d)] double NumberValueStep,
    double TargetNumberValue,

    // Check
    bool TargetBoolValue,

    List<AnswerRowTeacherDTO> AnswerRows
);