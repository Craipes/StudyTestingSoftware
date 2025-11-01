namespace StudyTestingSoftware.DTO.StudentGroup;

public record StudentGroupPreviewDTO
(
    Guid Id,
    string Name,
    string? Description,
    int AvailableTestsCount,
    int UnfinishedTestsCount
);
