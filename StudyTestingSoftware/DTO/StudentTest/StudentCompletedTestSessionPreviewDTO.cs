namespace StudyTestingSoftware.DTO.StudentTest;

public record StudentCompletedTestSessionPreviewDTO
(
    Guid Id,
    string TestName,
    DateTime StartedAt,
    DateTime? FinishedAt,
    double Score,
    double MaxScore
);
