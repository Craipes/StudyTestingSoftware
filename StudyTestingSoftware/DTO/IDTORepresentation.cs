namespace StudyTestingSoftware.DTO;

public interface IDTORepresentation<Entity, DTO>
{
    void UpdateEntity(Entity entity);
    static abstract DTO CreateDTO(Entity entity);
}
