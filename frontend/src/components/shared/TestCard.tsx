import { createTestSession } from "@/lib/api";
import { AvailableTestItem } from "@/types";
import axios from "axios";
import { formatInTimeZone } from 'date-fns-tz'; 

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from 'react-hot-toast';

const KYIV_TIMEZONE = 'Europe/Kyiv';

export const TestCard = ({ test }: { test: AvailableTestItem }) => {
  const isClosed = test.hasCloseTime && new Date(test.closeAt) < new Date(); 
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionId = await createTestSession(test.id);
      router.push(`/dashboard/test/${sessionId}`);
      toast.success("Сесію тесту успішно створено!");
    } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const apiError = err.response.data;
      
      if (err.response.status === 409 && apiError?.errors?.[0]?.code === 'TS_UserHasActiveSession') {
        const errorMessage = "У вас вже є активний сеанс тестування. Завершіть його, перш ніж починати новий.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if(err.response.status === 403 && apiError?.errors?.[0]?.code === 'TS_AttemptLimitReached'){
        const errorMessage = "Ви використали всі спроби.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
      else {
        const errorMessage = apiError.detail || "Не вдалося розпочати тест. Спробуйте ще раз.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } else {
      console.error("Помилка при створенні сесії тесту:", err);
      setError("Сталася помилка. Перевірте з'єднання та спробуйте ще раз.");
      toast.error("Сталася помилка. Перевірте з'єднання.");
    }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-4 dark:bg-gray-800 rounded-lg bg-white shadow-md ${isClosed ? 'bg-gray-100 opacity-60' : 'hover:shadow-lg transition'}`}>
      <h3 className="text-xl dark:text-white font-bold text-indigo-600">{test.name}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-2">{test.description}</p>
      
      <div className="text-sm space-y-1">
        <p>⏳ Тривалість: {test.durationInMinutes} хв.</p>
        <p>🔢 Питань: {test.questionsCount}</p>
        <p>🛡️ Спроб: {test.attemptsLimit === 0 ? 'Безлімітно' : test.attemptsLimit}</p>
        {test.hasCloseTime && (
          <p className={isClosed ? 'text-red-500 font-medium' : 'text-green-600'}>
            📅 Доступний до: 
            {formatInTimeZone(new Date(test.closeAt), KYIV_TIMEZONE, 'dd.MM.yyyy HH:mm')}
            {isClosed && ' (Закрито)'}
          </p>
        )}
      </div>
      
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      
      <div className="mt-4 flex justify-end">
        <button  
          className="btn-primary w-[35%]"
          onClick={handleStartTest}
          disabled={isClosed || isLoading}
        >
          {isLoading ? 'Створення сесії...' : (isClosed ? 'Завершився' : 'Розпочати')}
        </button>
      </div>
    </div>
  );
};