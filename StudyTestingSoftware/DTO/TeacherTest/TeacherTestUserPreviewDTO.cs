namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestUserPreviewDTO
(
    ShortUserInfoDTO UserInfo,
    int AttemptsCount,
    double BestScore,
    DateTime? LastAttemptAt
);
