using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Models;

public class AppUser : IdentityUser<Guid>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? MiddleName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int Experience { get; set; }
    public int Level { get; set; } = 1;
    public int Coins { get; set; }

    public List<Test> AuthoredTests { get; set; } = [];
    public List<TestSession> TestSessions { get; set; } = [];
    public List<StudentGroup> OwnedStudentGroups { get; set; } = [];
    public List<StudentGroup> StudentGroups { get; set; } = [];
}
