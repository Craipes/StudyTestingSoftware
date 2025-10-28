namespace StudyTestingSoftware.DTO.Customization;

public record CustomizationItemMarketDTO
(
    string CodeId,
    string Name,
    string Description,
    CustomizationType Type,
    string ImageUrl,
    bool UnlockedByDefault,
    bool UnlockedByLevelUp,
    int Price,
    int LevelRequired,
    bool IsOwned
);
