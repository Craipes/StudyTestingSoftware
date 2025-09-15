using Microsoft.AspNetCore.Identity;

namespace StudyTestingSoftware.Models;

public class AppUser : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? MiddleName { get; set; }
}
