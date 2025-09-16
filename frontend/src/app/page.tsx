// src/app/page.tsx

import Link from 'next/link';
import FloatingShapesBackground from '@/components/shared/FloatingShapesBackground';

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 overflow-hidden">
      <FloatingShapesBackground />
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Ласкаво просимо!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Це застосунок для тестування. Будь ласка, увійдіть або зареєструйтеся, щоб продовжити.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300">
            Увійти
          </Link>
          <Link href="/register" className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300">
            Зареєструватися
          </Link>
        </div>
      </div>
    </main>
  );
}