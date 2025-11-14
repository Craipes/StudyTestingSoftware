'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { AuthTokens } from '@/types';
import { LoginForm } from '@/components/shared/LoginForm';
import Link from 'next/link';
import { handleApiError } from '@/utils/handle-api-errors';
import { RevealWrapper } from 'next-reveal';


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');

  const handleLogin = async (data: any) => {
    setError('');

    try {
      const response = await axios.post<AuthTokens>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email: data.email,
          password: data.password,
          twoFactorCode: 'string', 
          twoFactorRecoveryCode: 'string',
        }
      );

      Cookies.set('accessToken', response.data.accessToken, { expires: 1 / 24 });
      Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });

      toast.success('Успішний вхід!');
      router.push('/dashboard');
    } catch (err: any) {
        if(err?.response.status === 401) {
        setError('Некоректні дані.');
        return;
      } else{
        handleApiError(err,'Авторизація не вдалася. Спробуйте ще раз пізніше.');
      }
    }
  };

  return (
    <main>
      <RevealWrapper delay={200} duration={1000} origin="top" distance="20px" reset={false}>
      <div className="flex -z-10 relative items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 p-4">      
        <div className=" relative z-10 w-full max-w-md dark:bg-slate-950 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">Вхід</h2>
          <LoginForm onSubmit={handleLogin} error={error} />
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
            Немає акаунту?{' '}
            <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">
              Зареєструватися
            </Link>
          </p>
        </div>
      </div>
      </RevealWrapper>
    </main>
  );
}