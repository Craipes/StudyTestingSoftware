import axios from 'axios';
import { RegisterFormData, AuthTokens } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Функція для реєстрації користувача
export const registerUser = async (data: RegisterFormData): Promise<AuthTokens> => {
  const response = await api.post<AuthTokens>('/auth/register', data);
  return response.data;
};