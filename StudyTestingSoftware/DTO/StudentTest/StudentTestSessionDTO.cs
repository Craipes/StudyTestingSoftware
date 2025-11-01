namespace StudyTestingSoftware.DTO.StudentTest;

public record StudentTestSessionDTO
(
    Guid Id,
    string TestName,
    DateTime StartedAt,
    DateTime? FinishedAt,
    DateTime? AutoFinishAt,
    double Score,
    bool IsCompleted,
    int DurationInMinutes,
    List<StudentTestSessionQuestionDTO> Questions
);
