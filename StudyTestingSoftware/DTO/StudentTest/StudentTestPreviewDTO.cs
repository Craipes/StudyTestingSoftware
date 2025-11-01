using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO.StudentTest;

public record StudentTestPreviewDTO
(
    Guid Id,
    string Name,
    string? Description,
    TestAccessMode AccessMode,
    bool IsPublished,
    bool IsOpened,
    bool HasCloseTime,
    DateTime? CloseAt,
    int QuestionsCount,
    int DurationInMinutes,
    int AttemptsLimit,
    int UsedAttemptsCount
);
