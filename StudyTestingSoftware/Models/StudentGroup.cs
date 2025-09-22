using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Models;

public class StudentGroup : BaseEntity
{
    [MinLength(1), MaxLength(128)] public string Name { get; set; } = string.Empty;
    [MaxLength(4096)] public string? Description { get; set; }

    public required AppUser? Owner { get; set; }
    public Guid? OwnerId { get; set; }

    public List<AppUser> Students { get; set; } = [];
    public List<Test> OpenedTests { get; set; } = [];
}
