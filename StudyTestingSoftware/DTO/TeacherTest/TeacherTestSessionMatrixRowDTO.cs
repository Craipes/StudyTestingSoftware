namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestSessionMatrixRowDTO
(
    Guid Id,
    string Text,
    Guid? SelectedColumnId,
    Guid CorrectColumnId
);
