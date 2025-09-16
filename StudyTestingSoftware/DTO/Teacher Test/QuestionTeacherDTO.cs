using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO;

public record QuestionTeacherDTO
(
    Guid? Id,
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
) : IDTORepresentation<Question, QuestionTeacherDTO>
{
    public void UpdateEntity(Question question)
    {
        question.Text = Text;
        question.Order = Order;
        question.Points = Points;
        question.QuestionType = QuestionType;
        question.ShuffleAnswers = ShuffleAnswers;
        question.MinNumberValue = MinNumberValue;
        question.MaxNumberValue = MaxNumberValue;
        question.NumberValueStep = NumberValueStep;
        question.TargetNumberValue = TargetNumberValue;
        question.TargetBoolValue = TargetBoolValue;
    }

    public static QuestionTeacherDTO CreateDTO(Question question)
    {
        return new QuestionTeacherDTO
        (
            question.Id,
            question.Text,
            question.Order,
            question.Points,
            question.QuestionType,
            question.ShuffleAnswers,
            question.MinNumberValue,
            question.MaxNumberValue,
            question.NumberValueStep,
            question.TargetNumberValue,
            question.TargetBoolValue,
            question.AnswerRows.Select(AnswerRowTeacherDTO.CreateDTO).ToList()
        );
    }
}