'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios'; 
import { createTestSession } from '@/lib/api';
import { GroupTestPreview } from '@/app/dashboard/(student)/groups/page';


interface TestCardProps {
  test: GroupTestPreview;
}

const StudentsGroupsTestCard = ({ test }: TestCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionId = await createTestSession(test.id);
      router.push(`/testing/test/${sessionId}`);
      toast.success("Сесію тесту успішно створено!");

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data;
        
        if (err.response.status === 409 && apiError?.errors?.[0]?.code === 'TS_UserHasActiveSession') {
          const errorMessage = "У вас вже є активний сеанс тестування.";
          setError(errorMessage);
          toast.error(errorMessage);
        } else if(err.response.status === 403 && apiError?.errors?.[0]?.code === 'TS_AttemptLimitReached'){
          const errorMessage = "Ви використали всі спроби.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
        else {
          const errorMessage = apiError.detail || "Не вдалося розпочати тест.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        console.error("Помилка при створенні сесії тесту:", err);
        const errorMessage = "Сталася помилка. Спробуйте ще раз.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
        <div className='mb-4 sm:mb-0 flex-1'>
          <h3 className="text-xl font-semibold dark:text-gray-100">{test.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{test.description}</p>
        </div>
        {test.isOpened ? (
          <button 
            onClick={handleStartTest}
            disabled={isLoading}
            className="px-4 py-2 text-center w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Створення сесії...' : 'Почати'}
          </button>
        ) : (
          <span className="px-4 py-2 text-center w-full sm:w-auto bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed">
            Закрито
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2 text-right w-full">
          {error}
        </div>
      )}

      <div className="border-t dark:border-gray-700 mt-4 pt-4 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
        <p><strong>Питань:</strong> {test.questionsCount}</p>
        <p><strong>Тривалість:</strong> {test.durationInMinutes} хв.</p>
        <p><strong>Спроби:</strong> {test.usedAttemptsCount} / {test.attemptsLimit === 0 ? 'Необмежено' : test.attemptsLimit}</p>
        {test.hasCloseTime && (
            <p className="text-red-500"><strong>Закриється:</strong> {new Date(test.closeAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default StudentsGroupsTestCard;