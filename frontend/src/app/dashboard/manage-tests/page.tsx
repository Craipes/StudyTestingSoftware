'use client';

import api from '@/lib/axios';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash } from 'lucide-react';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';

interface TestPreview {
  id: string;
  name: string;
  accessMode: number;
  isPublished: boolean;
  isOpened: boolean;
  hasCloseTime: boolean;
  closeAt: string | null;
  questionsCount: number;
}

const ManageTestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<TestPreview[]>([]);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Керування тестами'}
  ];

  useEffect(() => {
    async function fetchTestsPreview() {
      try {
        const response = await api.get('/teacher/tests/list-previews');
        setTests(response.data);
      } catch (err) {
        toast.error('Помилка при завантаженні тестів.');
      } finally {
        setLoading(false);
      }
    }
    fetchTestsPreview();
  }, []);

  const handleDelete = async () => {
    if (!deletingTestId) return;

    try {
      await api.delete(`/teacher/tests/delete/${deletingTestId}`);
      setTests((prevTests) => prevTests.filter((test) => test.id !== deletingTestId));
      toast.success('Тест успішно видалено.');
    } catch (err) {
      toast.error('Помилка при видаленні тесту.');
    } finally {
      setDeletingTestId(null);
    }
  };

  const getStatusText = (test: TestPreview) => {
    return test.isPublished ? 'Опубліковано' : 'Не опубліковано';
  };

  return (
    <div>
      {loading ? (
        <div>Завантаження тестів...</div>
      ) : (
        <div className='flex-1 pt-6 sm:p-8'>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6'>
            Керування тестами
            <Breadcrumbs items={breadcrumbItems} />
          </h1>

          <div className='border border-blue-600 hover:bg-blue-700 transition-colors duration-300 text-blue-600 hover:text-white rounded-lg px-4 py-2 mb-6 w-fit'>
            <Link href="/dashboard/create-test" className="text-sm font-medium ">
              Створити тест
            </Link>
          </div>

          {tests.length > 0 ? (
            <div className="space-y-4 sm:space-y-0 sm:grid-cols-2 sm:grid sm:gap-4">
              {tests.map((test) => (
                <div key={test.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{test.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Питань: {test.questionsCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Статус: {getStatusText(test)}</p>
                    {test.hasCloseTime && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Закриття: {new Date(test.closeAt!).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                    >
                      <Edit size={20} />
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-gray-700"
                          onClick={() => setDeletingTestId(test.id)}
                        >
                          <Trash size={20} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Цю дію неможливо скасувати. Це назавжди видалить тест.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white hover:bg-gray-300 hover:dark:bg-gray-900" onClick={() => setDeletingTestId(null)}>Скасувати</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>Видалити</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>У вас ще немає створених тестів.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageTestsPage;