using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.Models;

public abstract class BaseEntity
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
}
