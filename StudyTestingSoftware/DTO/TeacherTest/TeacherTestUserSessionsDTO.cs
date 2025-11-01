namespace StudyTestingSoftware.DTO.TeacherTest;

public record TeacherTestUserSessionsDTO
(
    FullUserInfoDTO UserInfo,
    double MaxScore,
    double MaxUserScore,
    List<TeacherTestSessionPreviewDTO> Sessions
);
