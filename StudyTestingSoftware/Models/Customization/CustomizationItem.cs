using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Models.Customization;

public class CustomizationItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CustomizationType CustomizationType { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool UnlockedByDefault { get; set; }
    public bool UnlockedByLevelUp { get; set; }
    [Range(0, int.MaxValue)] public int Price { get; set; }
    [Range(0, int.MaxValue)] public int LevelRequired { get; set; }
}
