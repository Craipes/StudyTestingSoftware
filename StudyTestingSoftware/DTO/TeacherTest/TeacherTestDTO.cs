using System.ComponentModel.DataAnnotations;

namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestDTO
(
    Guid? Id,
    [MinLength(1), MaxLength(128)] string Name,
    [MaxLength(4096)] string? Description,
    [Range(0, 100000)] int MaxExperience,
    TestAccessMode AccessMode,
    int DurationInMinutes,
    int AttemptsLimit,
    bool ShuffleQuestions,
    bool ShuffleAnswers,
    bool IsPublished,
    bool IsOpened,
    bool HasCloseTime,
    DateTime? CloseAt,
    Guid? AuthorId,
    List<QuestionTeacherDTO> Questions
) : IDTOEditRepresentation<Test, TeacherTestDTO>
{
    public void UpdateEntity(Test test)
    {
        test.Name = Name;
        test.Description = Description;
        test.MaxExperience = MaxExperience;
        test.AccessMode = AccessMode;
        test.DurationInMinutes = DurationInMinutes;
        test.AttemptsLimit = AttemptsLimit;
        test.ShuffleQuestions = ShuffleQuestions;
        test.ShuffleAnswers = ShuffleAnswers;
        test.IsPublished = IsPublished;
        test.HasCloseTime = HasCloseTime;
        test.CloseAt = CloseAt;

        if (!test.IsOpened && IsOpened)
        {
            test.OpenedAt = DateTime.UtcNow;
        }
        test.IsOpened = IsOpened;
    }

    public static TeacherTestDTO CreateDTO(Test test)
    {
        return new TeacherTestDTO
        (
            test.Id,
            test.Name,
            test.Description,
            test.MaxExperience,
            test.AccessMode,
            test.DurationInMinutes,
            test.AttemptsLimit,
            test.ShuffleQuestions,
            test.ShuffleAnswers,
            test.IsPublished,
            test.IsOpened,
            test.HasCloseTime,
            test.CloseAt,
            test.AuthorId,
            test.Questions.Select(QuestionTeacherDTO.CreateDTO).OrderBy(q => q.Order).ToList()
        );
    }
}