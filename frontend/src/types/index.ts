
export interface AuthTokens {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}
export interface RegisterFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  isTeacher: boolean;
  isStudent: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}

export enum QuestionType {
    SingleChoice = 0,
    MultipleChoice = 1,
    TableSingleChoice = 2,
    Ordering = 3,
    Slider = 4,
    YesNo = 5,
}

export enum AccessMode {
    Private = 0,
    Group = 1,
    Public = 2,
}

export interface FetchAvailableTestsParams {
  page: number;
  pageSize: number;
}

export interface AvailableTestItem {
  id: string;
  name: string;
  description: string;
  accessMode: AccessMode; 
  isPublished: boolean;
  isOpened: boolean;
  hasCloseTime: boolean;
  closeAt: string; 
  questionsCount: number;
  durationInMinutes: number;
  attemptsLimit: number;
}

export interface ResultTestItem {

}

export interface CompletedTestSessionsItem {
  id: string;
  testName: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  maxScore: number;
}

export interface AvailableTestsResponse {
  items: AvailableTestItem[];
  totalPagesCount: number;
}

export interface CompletedTestSessionsResponse {
  items: CompletedTestSessionsItem[];
  totalPagesCount: number;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  resetValue?: boolean;
  booleanValue?: boolean;
  numberValue?: number;
  selectedChoiceOptionId?: string;
  selectedMatrixRowId?: string;
  selectedMatrixColumnId?: string;
}