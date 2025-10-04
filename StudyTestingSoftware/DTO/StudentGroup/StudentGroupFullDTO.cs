namespace StudyTestingSoftware.DTO.StudentGroup;

public record StudentGroupFullDTO
(
    Guid Id,
    string Name,
    string? Description,
    UserInfoDTO? Owner,
    List<UserInfoDTO> Students,
    List<StudentTestPreviewDTO> Tests
);
