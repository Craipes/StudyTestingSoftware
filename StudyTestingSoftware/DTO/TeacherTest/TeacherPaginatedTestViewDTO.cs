namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherPaginatedTestViewDTO
(
    Guid Id,
    string Name,
    string? Description,
    int QuestionsCount,
    int TotalPoints,
    bool IsPublished,
    bool IsOpened,
    TestAccessMode AccessMode,
    int DurationInMinutes,
    int AttemptsLimit,
    bool HasCloseTime,
    DateTime? CloseAt,
    List<TeacherTestUserPreviewDTO> Users,
    int TotalPagesCount
);
