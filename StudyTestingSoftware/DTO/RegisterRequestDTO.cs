namespace StudyTestingSoftware.DTO;

public record RegisterRequestDTO
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? MiddleName { get; set; }

    public bool IsTeacher { get; set; }
    public bool IsStudent { get; set; }
}
