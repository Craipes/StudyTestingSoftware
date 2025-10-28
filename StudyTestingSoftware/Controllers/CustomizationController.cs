using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Controllers;

[Route("customization")]
[ApiController]
[Authorize]
public class CustomizationController : ControllerBase
{
    private readonly CustomizationManager customizationManager;
    private readonly UserManager<AppUser> userManager;

    public CustomizationController(CustomizationManager customizationManager, UserManager<AppUser> userManager)
    {
        this.customizationManager = customizationManager;
        this.userManager = userManager;
    }

    [HttpGet("market")]
    public async Task<ActionResult<List<CustomizationItemMarketDTO>>> GetCustomizationMarket()
    {
        if (!Guid.TryParse(userManager.GetUserId(User), out var userId))
        {
            return Unauthorized();
        }
        var marketItems = await customizationManager.GetMarketForUser(userId);
        return marketItems;
    }

    [HttpPost("purchase/{itemId:guid}")]
    public async Task<ActionResult> PurchaseCustomizationItem(Guid itemId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        var success = await customizationManager.PurchaseCustomizationItem(user, itemId);
        if (!success)
        {
            return BadRequest("Purchase failed.");
        }
        return Ok();
    }

    [HttpPost("equip/{itemId:guid}")]
    public async Task<ActionResult> EquipCustomizationItem(Guid itemId)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }
        await customizationManager.EquipCustomizationItem(user, itemId);
        return Ok();
    }
}
