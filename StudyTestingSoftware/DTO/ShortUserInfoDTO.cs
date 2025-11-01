namespace StudyTestingSoftware.DTO;

public record ShortUserInfoDTO
(
    Guid Id,
    string FirstName,
    string LastName,
    string? MiddleName,
    int Level,
    double Experience,
    double RequiredExperience,
    string? AvatarUrl,
    string? AvatarFrameUrl,
    string? BackgroundUrl
);