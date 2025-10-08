namespace StudyTestingSoftware.DTO;

public record FullUserInfoDTO
(
    Guid Id,
    string FirstName,
    string LastName,
    string? MiddleName,
    bool IsTeacher, 
    bool IsStudent
) : ShortUserInfoDTO(Id, FirstName, LastName, MiddleName);