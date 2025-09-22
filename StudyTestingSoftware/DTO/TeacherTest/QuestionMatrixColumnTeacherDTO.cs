namespace StudyTestingSoftware.DTO.TeacherTest;

public record QuestionMatrixColumnTeacherDTO
(
    Guid? Id,
    string Text,
    int Order
) : IDTOEditRepresentation<QuestionMatrixColumn, QuestionMatrixColumnTeacherDTO>
{
    public void UpdateEntity(QuestionMatrixColumn matrixColumn)
    {
        matrixColumn.Text = Text;
        matrixColumn.Order = Order;
    }
    public static QuestionMatrixColumnTeacherDTO CreateDTO(QuestionMatrixColumn matrixColumn)
    {
        return new QuestionMatrixColumnTeacherDTO
        (
            matrixColumn.Id,
            matrixColumn.Text,
            matrixColumn.Order
        );
    }
}
