namespace StudyTestingSoftware.DTO;

public interface IDTORepresentation<Entity, DTO>
{
    Guid? Id { get; }
    void UpdateEntity(Entity entity);
    static abstract DTO CreateDTO(Entity entity);
}
