namespace StudyTestingSoftware.DTO.TeacherGroup;

public record TeacherGroupPreviewDTO
(
    Guid Id,
    string Name,
    string? Description,
    int StudentsCount,
    int TestsCount
);
