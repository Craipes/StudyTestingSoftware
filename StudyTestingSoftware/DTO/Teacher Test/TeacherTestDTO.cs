using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO;

public record TeacherTestDTO
(
    [MinLength(1), MaxLength(128)] string Name,
    [MaxLength(4096)] string? Description,
    [Range(0, 100000)] int MaxExperience,
    TestAccessMode AccessMode,
    int DurationInMinutes,
    bool ShuffleQuestions,
    bool IsPublished,
    Guid? AuthorId,
    List<QuestionTeacherDTO> Questions
);
