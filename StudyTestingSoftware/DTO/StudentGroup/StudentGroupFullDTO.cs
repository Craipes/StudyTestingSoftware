namespace StudyTestingSoftware.DTO.StudentGroup;

public record StudentGroupFullDTO
(
    Guid Id,
    string Name,
    string? Description,
    FullUserInfoDTO? Owner,
    List<FullUserInfoDTO> Students,
    List<StudentTestPreviewDTO> Tests
);
