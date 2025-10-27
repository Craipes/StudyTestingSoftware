using Microsoft.AspNetCore.Identity;
using StudyTestingSoftware.Models.Customization;

namespace StudyTestingSoftware.Models;

public class AppUser : IdentityUser<Guid>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? MiddleName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public double Experience { get; set; }
    public double RequiredExperience { get; set; }
    public int Level { get; set; } = 1;
    public int Coins { get; set; }

    // Customization
    public Guid? ActiveAvatarId { get; set; }
    public CustomizationItem? ActiveAvatar { get; set; }
    public Guid? ActiveAvatarFrameId { get; set; }
    public CustomizationItem? ActiveAvatarFrame { get; set; }
    public Guid? ActiveBackgroundId { get; set; }
    public CustomizationItem? ActiveBackground { get; set; }

    public List<Test> AuthoredTests { get; set; } = [];
    public List<TestSession> TestSessions { get; set; } = [];
    public List<StudentGroup> OwnedStudentGroups { get; set; } = [];
    public List<StudentGroup> StudentGroups { get; set; } = [];
    public List<UserCustomizationItem> OwnedCustomizationItems { get; set; } = [];
}
