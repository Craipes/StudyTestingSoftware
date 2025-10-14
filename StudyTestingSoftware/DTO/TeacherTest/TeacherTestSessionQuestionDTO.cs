namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestSessionQuestionDTO
(
    Guid Id,
    string Text,
    int Points,
    QuestionType QuestionType,
    double ReceivedScore,

    double MinNumberValue,
    double MaxNumberValue,
    double NumberValueStep,

    double? SelectedNumberValue,
    bool? SelectedBooleanValue,

    double? ValidNumberValue,
    bool? ValidBooleanValue,

    List<TeacherTestSessionMatrixRowDTO> QuestionRows,
    List<TeacherTestSessionMatrixColumnDTO> QuestionColumns,
    List<TeacherTestSessionChoiceOptionDTO> ChoiceOptions
);
