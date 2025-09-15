

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import axios from 'axios';
import { AuthTokens } from '@/types'; 
import Link from 'next/link';


export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post<AuthTokens>(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        email,
        password,
      });
      
      router.push('/login'); 
    } catch (err) {
          if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data;

        if (apiError.errors) {
          const errorKeys = Object.keys(apiError.errors);
          if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0];
            const errorMessage = apiError.errors[firstErrorKey][0];
            setError(errorMessage);
            return; 
          }
        }
      }

    setError('Помилка реєстрації. Будь ласка, спробуйте ще раз.');
    console.error(err);
    }
  };

   return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Реєстрація</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300">
            Зареєструватися
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Вже маєте акаунт?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">Увійти</Link>
        </p>
      </div>
    </main>
  );
}