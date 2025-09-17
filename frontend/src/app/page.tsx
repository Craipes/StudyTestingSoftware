// src/app/page.tsx

import Link from 'next/link';
import FloatingShapesBackground from '@/components/shared/FloatingShapesBackground';


export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100  dark:bg-slate-900 p-4 overflow-hidden">
      <FloatingShapesBackground />
      <div className="relative z-10 bg-white dark:bg-slate-950 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Ласкаво просимо!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Це застосунок для тестування. Будь ласка, увійдіть або зареєструйтеся, щоб продовжити.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="w-full  sm:w-auto px-6 py-3 bg-blue-500  text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300">
            Увійти
          </Link>
          <Link href="/register" className="w-full dark:bg-gray-800 sm:w-auto px-6 py-3 bg-gray-200 dark:text-white text-gray-800 font-semibold rounded-lg hover:bg-gray-300 hover:dark:bg-gray-900 transition-colors duration-300">
            Зареєструватися
          </Link>
        </div>
      </div>
    </main>
  );
}