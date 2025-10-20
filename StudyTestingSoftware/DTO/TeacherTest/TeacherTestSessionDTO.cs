namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestSessionDTO
(
    Guid Id,
    string TestName,
    DateTime StartedAt,
    DateTime? FinishedAt,
    DateTime? AutoFinishAt,
    double Score,
    bool IsCompleted,
    int DurationInMinutes,
    int MaxScore,
    List<TeacherTestSessionQuestionDTO> Questions
);
