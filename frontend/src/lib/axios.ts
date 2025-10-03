import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import Cookies from 'js-cookie';

import { AuthTokens } from '../types';

const token = Cookies.get('accessToken');

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  },
});



api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };



    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
            window.location.href = '/login';
            return Promise.reject(error);
        }



        const res = await axios.post<AuthTokens>(`${process.env.API_URL}/auth/refresh`, {
          refreshToken,
        });



        Cookies.set('accessToken', res.data.accessToken, { expires: 1/24 });
        Cookies.set('refreshToken', res.data.refreshToken, { expires: 7 });

        return api(originalRequest);
      } catch (err) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);



export default api;