'use client';


import { getActiveTestSession, submitTestSession } from "@/lib/api";
import { useEffect, useState } from "react";
import { convertUtcStringToKyiv } from "@/utils/parse-date";
import Link from "next/link";
import { handleApiError } from "@/utils/handle-api-errors";

const ActiveSession = () => {
    const [activeSession,setActiveSession]=useState<null | {
        id:string;
        testName:string;
        startedAt:string;
        autoFinishAt:string;
        durationInMinutes:number;
      }>(null);
      const [loading,setLoading]=useState(true);
    
      useEffect(() => {
        async function fetchActiveTestSession() {
          try {
            const response = await getActiveTestSession();
            console.log(response);
            setActiveSession(response);
          } catch (err) {
                handleApiError(err, 'Помилка при отриманні активної сесії.');
          } finally {
            setLoading(false);
          }
        }
        fetchActiveTestSession();
      }, []);

      const handleSubmitTestSession = async () => {
        if (!activeSession) return;
        try {
          await submitTestSession(activeSession.id);
          setActiveSession(null);
        } catch (err: any) {
            handleApiError(err, 'Помилка при завершенні сесії.');
        }
      }


  return (
    <div>
        {activeSession ? (
            <div className="sm:flex flex-row sm:justify-between p-4 bg-white shadow-md rounded-lg dark:bg-gray-800 mt-4">
        <div className="sm:mb-0 mb-2">
          <p className="text-gray-600 dark:text-gray-300 mt-4">Перевірка активної сесії...</p>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-2">
              Активна сесія: {activeSession.testName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Початок: {convertUtcStringToKyiv(activeSession.startedAt)}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Завершення: {convertUtcStringToKyiv(activeSession.autoFinishAt)}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Тривалість: {activeSession.durationInMinutes} хвилин
            </p>
          </div>
      </div>
      <div className="flex flex-col gap-2 justify-end">
        <Link href={`/testing/test/${activeSession?.id}`} className="btn-primary">
            Продовжити
        </Link>
        <button onClick={handleSubmitTestSession} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center cursor-pointer justify-center">
          Завершити сесію
        </button>
      </div>
    </div>
        ) : (
            <p className="text-gray-600 dark:text-gray-300 mt-4">Немає активних сесій.</p>
        )}
    </div>
  )
}

export default ActiveSession