namespace StudyTestingSoftware.DTO;

public record QuestionChoiceOptionTeacherDTO
(
    Guid? Id,
    string Text,
    int Order,
    bool IsCorrect
) : IDTORepresentation<QuestionChoiceOption, QuestionChoiceOptionTeacherDTO>
{
    public void UpdateEntity(QuestionChoiceOption choiceOption)
    {
        choiceOption.Text = Text;
        choiceOption.Order = Order;
        choiceOption.IsCorrect = IsCorrect;
    }
    public static QuestionChoiceOptionTeacherDTO CreateDTO(QuestionChoiceOption choiceOption)
    {
        return new QuestionChoiceOptionTeacherDTO
        (
            choiceOption.Id,
            choiceOption.Text,
            choiceOption.Order,
            choiceOption.IsCorrect
        );
    }
}
