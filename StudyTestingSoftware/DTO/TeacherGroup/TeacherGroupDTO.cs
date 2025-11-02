using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO.TeacherGroup;

public record TeacherGroupDTO
(
    Guid? Id,
    [MinLength(1), MaxLength(128)] string Name,
    [MaxLength(4096)] string? Description
);
