namespace StudyTestingSoftware.DTO;

public record RegisterRequestDTO
(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? MiddleName,
    bool IsTeacher,
    bool IsStudent
);
