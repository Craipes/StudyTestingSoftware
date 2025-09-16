'use client';

import { useState } from 'react';
import axios from 'axios';
import { ChangePasswordForm } from '@/components/shared/ChangePasswordForm';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleChangePassword = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        toast.error('Немає токена. Будь ласка, увійдіть знову.');
        router.push('/login');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/manage/info`,
        {
          newEmail: null,
          newPassword: data.newPassword,
          oldPassword: data.oldPassword,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      toast.success('Пароль успішно змінено!');
      router.push('/dashboard');
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Невірний старий пароль.');
        } else {
          setError('Помилка під час зміни пароля. Спробуйте знову.');
        }
      } else {
        setError('Сталася невідома помилка.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white mt-[20vh] p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Зміна пароля</h1>
        <ChangePasswordForm onSubmit={handleChangePassword} loading={loading} error={error} />
      </div>
    </div>
  );
}