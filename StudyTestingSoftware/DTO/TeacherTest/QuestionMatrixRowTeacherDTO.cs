namespace StudyTestingSoftware.DTO.TeacherTest;

public record QuestionMatrixRowTeacherDTO
(
    Guid? Id,
    string Text,
    int Order,
    int ValidColumnOrder
) : IDTOEditRepresentation<QuestionMatrixRow, QuestionMatrixRowTeacherDTO>
{
    public void UpdateEntity(QuestionMatrixRow matrixRow)
    {
        matrixRow.Text = Text;
        matrixRow.Order = Order;
    }
    public static QuestionMatrixRowTeacherDTO CreateDTO(QuestionMatrixRow matrixRow)
    {
        return new QuestionMatrixRowTeacherDTO
        (
            matrixRow.Id,
            matrixRow.Text,
            matrixRow.Order,
            matrixRow.CorrectMatrixColumn.Order
        );
    }
}
