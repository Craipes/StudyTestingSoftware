namespace StudyTestingSoftware.DTO;

public record AnswerRowTeacherDTO
(
    string Text,
    int Order,
    List<AnswerOptionTeacherDTO> AnswerOptions
);
