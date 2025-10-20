import { CompletedTestSessionsItem } from "@/types";
import { convertUtcStringToKyiv} from "@/utils/pare-date";



export const TestResultCard = ({ sessionResult }: { sessionResult: CompletedTestSessionsItem }) => {

  return (
    <div className={`p-4 dark:bg-gray-800 rounded-lg bg-white shadow-md`}>
      <h3 className="text-xl dark:text-white font-bold text-indigo-600">{sessionResult.testName}</h3>
      
      <div className="text-sm space-y-1">
        <p>⏳ Розпочато: {convertUtcStringToKyiv(sessionResult.startedAt)}</p>
        <p>🔢 Завершено: {convertUtcStringToKyiv(sessionResult.finishedAt)}</p>
      </div>

      <div className="text-sm space-y-1 mt-2">
        <p>🏆 Результат: {sessionResult.score.toFixed(1)} з {sessionResult.maxScore}</p>
      </div>
    </div>
  );
};