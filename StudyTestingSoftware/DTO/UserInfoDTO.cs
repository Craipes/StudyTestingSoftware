namespace StudyTestingSoftware.DTO;

public record UserInfoDTO
(
    Guid Id,
    string FirstName, 
    string LastName, 
    string? MiddleName, 
    bool IsTeacher, 
    bool IsStudent
);
