import { RegisterFormData, AuthTokens, AvailableTestsResponse, FetchAvailableTestsParams, CompletedTestSessionsResponse } from '@/types';
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
  level:number;
  experience:number;
  requiredExperience:number;
  coins:number;
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

//Get students completed test sessions
export const fetchCompletedTestSessions = async ({page,pageSize}:FetchAvailableTestsParams ): Promise<CompletedTestSessionsResponse> => {
  const response=await api.get<CompletedTestSessionsResponse>(`/student/tests/completed-sessions`,{
    params: { page, pageSize }
  });
  return response.data;
}

//Create test session for student
export const createTestSession = async (testId:string): Promise<{sessionId:string}> => {
  const response=await api.post<{sessionId:string}>(`/student/tests/start/${testId}`);
  return response.data;
}

//Get current test session if exists
export const getActiveTestSession = async ():Promise<{
  id:string;
  testName:string;
  startedAt:string;
  autoFinishAt:string;
  durationInMinutes:number;
}>  => {
  const response=await api.get('/student/tests/active-sessions');
  return response.data[0];
}

//Submit test session
export const submitTestSession = async (sessionId:string):Promise<void> => {
  await api.post(`/student/tests/session/${sessionId}/submit`);
}