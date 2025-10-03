import { CompletedTestSessionsItem } from "@/types";
import { format } from 'date-fns';

export const TestResultCard = ({ sessionResult }: { sessionResult: CompletedTestSessionsItem }) => {
  
  return (
    <div className={`p-4 dark:bg-gray-800 rounded-lg bg-white shadow-md`}>
      <h3 className="text-xl dark:text-white font-bold text-indigo-600">{sessionResult.testName}</h3>
      
      <div className="text-sm space-y-1">
        <p>⏳ Розпочато: {format(new Date(sessionResult.startedAt), 'dd.MM.yyyy HH:mm')}</p>
        <p>🔢 Завершено: {format(new Date(sessionResult.finishedAt), 'dd.MM.yyyy HH:mm')}</p>
      </div>

        <div className="text-sm space-y-1 mt-2">
        <p>🏆 Результат: {sessionResult.score} з {sessionResult.maxScore}</p>
        </div>
    </div>
  );
};