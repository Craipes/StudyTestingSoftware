namespace StudyTestingSoftware.DTO;

public record QuestionMatrixColumnTeacherDTO
(
    Guid? Id,
    string Text,
    int Order
) : IDTORepresentation<QuestionMatrixColumn, QuestionMatrixColumnTeacherDTO>
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
