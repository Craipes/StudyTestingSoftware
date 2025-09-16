namespace StudyTestingSoftware.DTO;

public record UserInfoDTO
(
    string FirstName, 
    string LastName, 
    string? MiddleName, 
    bool IsTeacher, 
    bool IsStudent
);
