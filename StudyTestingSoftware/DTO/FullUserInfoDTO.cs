namespace StudyTestingSoftware.DTO;

public record FullUserInfoDTO
(
    Guid Id,
    string FirstName,
    string LastName,
    string? MiddleName,
    int Level,
    double Experience,
    double RequiredExperience,
    bool IsTeacher, 
    bool IsStudent,
    int Coins
) : ShortUserInfoDTO(Id, FirstName, LastName, MiddleName, Level, Experience, RequiredExperience);