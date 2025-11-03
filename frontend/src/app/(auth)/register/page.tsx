'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { registerUser } from '@/lib/api';
import { RegisterForm } from '@/components/shared/RegisterForm'; 
import { handleApiError } from '@/utils/handle-api-errors';
import { RevealWrapper } from 'next-reveal';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');

  const handleRegister = async (data: any) => {
    setError('');

    try {
      await registerUser(data);
      toast.success('Реєстрація успішна! Тепер ви можете увійти.');
      router.push('/login');
    } catch (err: any) {
        handleApiError(err, 'Помилка при реєстрації.');
    }
  };

  return (
    <main>
      <RevealWrapper delay={200} duration={1000} origin="top" distance="20px" reset={false}>
      <div className="flex items-center justify-center min-h-screen dark:bg-slate-900 bg-gray-100 p-4">
        <div className="w-full max-w-md dark:bg-slate-950 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6">Реєстрація</h2>
        <RegisterForm onSubmit={handleRegister} error={error} />
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Вже маєте акаунт?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
            Увійти
          </Link>
        </p>
      </div>
      </div>
      </RevealWrapper>
    </main>
  );
}