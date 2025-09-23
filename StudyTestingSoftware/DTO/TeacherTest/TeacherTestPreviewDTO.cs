using StudyTestingSoftware.Data;
using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestPreviewDTO
(
    Guid Id,
    [MinLength(1), MaxLength(128)] string Name,
    TestAccessMode AccessMode,
    bool IsPublished,
    bool IsOpened,
    bool HasCloseTime,
    DateTime? CloseAt,
    int QuestionsCount
);
