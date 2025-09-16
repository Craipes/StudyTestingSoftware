
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