import { RegisterFormData, AuthTokens, AvailableTestsResponse, FetchAvailableTestsParams } from '@/types';
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

//Get availble tests for student
export const fetchAvailableTests = async ({page,pageSize}:FetchAvailableTestsParams): Promise<AvailableTestsResponse> => {
  const response=await api.get<AvailableTestsResponse>(`/student/tests/list-available-tests`,{
    params: { page, pageSize }
  });
  return response.data;
}