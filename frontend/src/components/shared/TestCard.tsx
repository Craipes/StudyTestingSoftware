import { AvailableTestItem } from "@/types";
import { format } from 'date-fns';
import {useRouter} from "next/navigation";

export const TestCard = ({ test }: { test: AvailableTestItem }) => {
  const isClosed = test.hasCloseTime && new Date(test.closeAt) < new Date();
  const router = useRouter();
  
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
            📅 Доступний до: {format(new Date(test.closeAt), 'dd.MM.yyyy HH:mm')}
            {isClosed && ' (Закрито)'}
          </p>
        )}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          className="btn-primary w-[35%]"
          onClick={() => {router.push(`/student/test/${test.id}`)}}
          disabled={isClosed}
        >
          {isClosed ? 'Завершився' : 'Розпочати'}
        </button>
      </div>
    </div>
  );
};