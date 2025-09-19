namespace StudyTestingSoftware.DTO;

public interface IDTORepresentation<Entity, DTO>
{
    static abstract DTO CreateDTO(Entity entity);
}
