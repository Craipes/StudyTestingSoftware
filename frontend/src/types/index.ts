export interface AuthTokens {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  errors: error[] | null;
}

export interface error{
  error: string| null;
}

export interface AuthPayload {
  email: string;
  password?: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  status: number;
}