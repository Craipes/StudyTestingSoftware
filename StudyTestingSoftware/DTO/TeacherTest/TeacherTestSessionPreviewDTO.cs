namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestSessionPreviewDTO
(
    Guid Id,
    DateTime StartedAt,
    DateTime? FinishedAt,
    double Score,
    bool IsCompleted
);
