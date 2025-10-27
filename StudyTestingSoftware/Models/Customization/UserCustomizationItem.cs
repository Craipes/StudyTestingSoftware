namespace StudyTestingSoftware.Models.Customization;

public class UserCustomizationItem
{
    public Guid UserId { get; set; }
    public required AppUser User { get; set; }
    public Guid CustomizationItemId { get; set; }
    public required CustomizationItem CustomizationItem { get; set; }
    public DateTime AcquiredAt { get; set; } = DateTime.UtcNow;
}
