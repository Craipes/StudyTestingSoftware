import { RegisterFormData, AuthTokens } from '@/types';
import api from './axios';

// Register a new user
export const registerUser = async (data: RegisterFormData): Promise<AuthTokens> => {
  const response = await api.post<AuthTokens>('/auth/register', data);
  return response.data;
};

// Get user information
export const getUser = async (): Promise<{
  firstName: string;
  lastName: string;
  middleName: string;
  isTeacher: boolean;
  isStudent: boolean;
}> => {
  const response = await api.get('/user/info');
  return response.data;
};

//Login user
export const loginUser = async (email: string, password: string,): Promise<AuthTokens> => {
  const response = await api.post<AuthTokens>('/auth/login', { email, password });
  return response.data;
}