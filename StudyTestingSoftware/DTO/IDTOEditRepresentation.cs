namespace StudyTestingSoftware.DTO;

public interface IDTOEditRepresentation<Entity, DTO> : IDTORepresentation<Entity, DTO>
{
    Guid? Id { get; }
    void UpdateEntity(Entity entity);
}
