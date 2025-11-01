export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface UserAttempt {
  userInfo: UserInfo;
  attemptsCount: number;
  bestScore: number;
  lastAttemptAt: string;
}

export interface TestDetails {
  id: string;
  name: string;
  users: UserAttempt[];
  totalPagesCount: number;
}

export interface Session {
  id: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  isCompleted: boolean;
}

export interface UserSessionDetails {
  userInfo: UserInfo;
  maxScore: number;
  maxUserScore: number;
  sessions: Session[];
}

export interface TestPreview {
  id: string;
  name: string;
  accessMode: number;
  isPublished: boolean;
  isOpened: boolean;
  hasCloseTime: boolean;
  closeAt: string | null;
  questionsCount: number;
}