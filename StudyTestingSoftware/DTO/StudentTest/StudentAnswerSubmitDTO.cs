namespace StudyTestingSoftware.DTO.StudentTest;

public record StudentAnswerSubmitDTO
(
    Guid SessionId,
    Guid QuestionId,

    bool ResetValue,

    bool? BooleanValue,
    double? NumberValue,

    Guid? SelectedChoiceOptionId,
    Guid? SelectedMatrixRowId,
    Guid? SelectedMatrixColumnId
);