namespace StudyTestingSoftware.DTO.StudentTest;

public record StudentTestSessionQuestionDTO
(
    Guid Id,
    string Text,
    int Points,
    QuestionType QuestionType,

    double MinNumberValue,
    double MaxNumberValue,
    double NumberValueStep,

    double? SelectedNumberValue,
    bool? SelectedBooleanValue,

    List<StudentTestSessionMatrixRowDTO> QuestionRows,
    List<StudentTestSessionMatrixColumnDTO> QuestionColumns,
    List<StudentTestSessionChoiceOptionDTO> ChoiceOptions
);
