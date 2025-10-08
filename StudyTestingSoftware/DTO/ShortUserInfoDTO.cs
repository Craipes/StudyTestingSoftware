namespace StudyTestingSoftware.DTO;

public record ShortUserInfoDTO
(
    Guid Id,
    string FirstName,
    string LastName,
    string? MiddleName
);