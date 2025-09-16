namespace StudyTestingSoftware.DTO;

public record AnswerRowTeacherDTO
(
    Guid? Id,
    string Text,
    int Order,
    List<AnswerOptionTeacherDTO> AnswerOptions
) : IDTORepresentation<AnswerRow, AnswerRowTeacherDTO>
{
    public void UpdateEntity(AnswerRow answerRow)
    {
        answerRow.Text = Text;
        answerRow.Order = Order;
    }
    public static AnswerRowTeacherDTO CreateDTO(AnswerRow answerRow)
    {
        return new AnswerRowTeacherDTO
        (
            answerRow.Id,
            answerRow.Text,
            answerRow.Order,
            answerRow.AnswerOptions.Select(AnswerOptionTeacherDTO.CreateDTO).ToList()
        );
    }
}
