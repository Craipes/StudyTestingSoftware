namespace StudyTestingSoftware.DTO.StudentTest;

public record StudentActiveTestSessionPreviewDTO
(
    Guid Id,
    string TestName,
    DateTime StartedAt,
    DateTime? AutoFinishAt,
    int DurationInMinutes
);