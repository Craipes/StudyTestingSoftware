namespace StudyTestingSoftware.DTO;

public record AnswerOptionTeacherDTO
(
    Guid? Id,
    string Text,
    int Order,
    bool IsCorrect
) : IDTORepresentation<AnswerOption, AnswerOptionTeacherDTO>
{
    public void UpdateEntity(AnswerOption answerOption)
    {
        answerOption.Text = Text;
        answerOption.Order = Order;
        answerOption.IsCorrect = IsCorrect;
    }
    public static AnswerOptionTeacherDTO CreateDTO(AnswerOption answerOption)
    {
        return new AnswerOptionTeacherDTO
        (
            answerOption.Id,
            answerOption.Text,
            answerOption.Order,
            answerOption.IsCorrect
        );
    }
}
