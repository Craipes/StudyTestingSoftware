using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO;

public record QuestionTeacherDTO
(
    Guid? Id,
    string Text,
    int Order,
    [Range(0, 100)] int Points,
    QuestionType QuestionType,

    // Slider
    double MinNumberValue,
    double MaxNumberValue,
    [Range(0d, 1000000d)] double NumberValueStep,
    double TargetNumberValue,

    // Check
    bool TargetBoolValue,

    List<QuestionMatrixRowTeacherDTO> QuestionRows,
    List<QuestionMatrixColumnTeacherDTO> QuestionColumns,
    List<QuestionChoiceOptionTeacherDTO> ChoiceOptions
) : IDTOEditRepresentation<Question, QuestionTeacherDTO>
{
    public void UpdateEntity(Question question)
    {
        question.Text = Text;
        question.Order = Order;
        question.Points = Points;
        question.QuestionType = QuestionType;
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
            question.MinNumberValue,
            question.MaxNumberValue,
            question.NumberValueStep,
            question.TargetNumberValue,
            question.TargetBoolValue,
            question.QuestionRows.Select(QuestionMatrixRowTeacherDTO.CreateDTO).OrderBy(q => q.Order).ToList(),
            question.QuestionColumns.Select(QuestionMatrixColumnTeacherDTO.CreateDTO).OrderBy(q => q.Order).ToList(),
            question.ChoiceOptions.Select(QuestionChoiceOptionTeacherDTO.CreateDTO).OrderBy(q => q.Order).ToList()
        );
    }
}