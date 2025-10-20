'use client';

import api from '@/lib/axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Edit, Trash, Folder, ArrowLeft, Eye } from 'lucide-react';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';
import { TestDetails, TestPreview, UserSessionDetails } from '@/types/manage-tests-types';


const ManageTestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<TestPreview[]>([]);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestDetails | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<UserSessionDetails | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Керування тестами' }
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
  
  const handleOpenSessions = async (testId: string) => {
    setIsSessionsModalOpen(true);
    setLoadingSessions(true);
    setSelectedUserSessions(null); 
    try {
      const response = await api.get(`/teacher/tests/view/${testId}`);
      setSelectedTest(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні сесій.');
      setIsSessionsModalOpen(false); 
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleViewUserSessions = async (userId: string) => {
    if (!selectedTest) return;
    setLoadingSessions(true);
    try {
      const response = await api.get(`/teacher/tests/view/${selectedTest.id}/${userId}`);
      setSelectedUserSessions(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні сесій користувача.');
    } finally {
      setLoadingSessions(false);
    }
  };


  const handleDeleteSession = async () => {
    if (!deletingSessionId || !selectedUserSessions) return;
    try {
      await api.delete(`/teacher/tests/delete-session/${deletingSessionId}`);
      setSelectedUserSessions(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sessions: prev.sessions.filter(session => session.id !== deletingSessionId)
        };
      });
      toast.success('Сесію успішно видалено.');
    } catch (err) {
      toast.error('Помилка при видаленні сесії.');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const getStatusText = (test: TestPreview) => {
    return test.isPublished ? 'Опубліковано' : 'Не опубліковано';
  };

  const getAccessModeText = (mode: number) => {
    switch (mode) {
      case 0: return 'Приватний';
      case 1: return 'Груповий';
      default: return 'Публічний';
    }
  };

  const handleCloseModal = () => {
    setIsSessionsModalOpen(false);
    setSelectedTest(null);
    setSelectedUserSessions(null);
  };
  
  return (
    <div>
      {loading ? (
        <div>Завантаження тестів...</div>
      ) : (
        <div className='flex-1 pt-6 sm:p-8'>
          <div className="sm:flex flex-row justify-between items-center mb-6">
            <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0'>Керування тестами
              <Breadcrumbs items={breadcrumbItems} />
            </h1>
            <Link
              href={'/dashboard/create-test'}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Створити тест
            </Link>
          </div>

          {tests.length > 0 ? (
            <div className="space-y-4 sm:space-y-0 sm:grid-cols-2 sm:grid sm:gap-4">
              {tests.map((test) => (
                <div key={test.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{test.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Питань: {test.questionsCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Режим доступу: {getAccessModeText(test.accessMode)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Статус: {getStatusText(test)}</p>
                    {test.hasCloseTime && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Закриття: {new Date(test.closeAt!).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenSessions(test.id)}
                      title='Переглянути спроби'
                      className="p-2 rounded-md text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700"
                    >
                      <Folder size={20} />
                    </button>
                    <Link
                      title='Редагувати тест'
                      href={`/dashboard/edit-test/${test.id}`}
                      className="p-2 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                    >
                      <Edit size={20} />
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          title='Видалити тест'
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

      <Dialog open={isSessionsModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-11/12">
          <DialogHeader className='mb-4'>
            <DialogTitle>
              {selectedUserSessions
                ? `Сесії користувача: ${selectedUserSessions.userInfo.lastName} ${selectedUserSessions.userInfo.firstName}`
                : `Спроби тесту: ${selectedTest?.name || ''}`
              }
            </DialogTitle>
          </DialogHeader>

          {loadingSessions ? (
            <div className='p-8 text-center'>Завантаження...</div>
          ) : (
            <div>
              {selectedUserSessions ? (
                <div>
                  <button onClick={() => setSelectedUserSessions(null)} className="flex items-center gap-2 mb-4 text-sm text-blue-600 hover:underline">
                    <ArrowLeft size={16}/>
                    Назад до списку всіх користувачів
                  </button>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Початок</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Завершення</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Бал</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedUserSessions.sessions.map(session => (
                          <tr key={session.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(session.startedAt).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{session.finishedAt ? new Date(session.finishedAt).toLocaleString() : '---'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{session.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{session.isCompleted ? 'Завершено' : 'В процесі'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button onClick={() => setDeletingSessionId(session.id)} title='Видалити сесію' className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-gray-700">
                                    <Trash size={18}/>
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Видалити сесію?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Цю дію неможливо скасувати. Всі дані про цю спробу буде втрачено.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeletingSessionId(null)}>Скасувати</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteSession}>Видалити</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (

                <div>
                  {selectedTest?.users && selectedTest.users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Користувач</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кількість спроб</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Найкращий бал</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedTest.users.map(userAttempt => (
                            <tr key={userAttempt.userInfo.id}>
                              <td className="px-6 py-4 whitespace-nowrap">{`${userAttempt.userInfo.lastName} ${userAttempt.userInfo.firstName}`}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{userAttempt.attemptsCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{userAttempt.bestScore}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleViewUserSessions(userAttempt.userInfo.id)}
                                  className="px-3 py-1 text-sm  text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700"
                                >
                                  <Eye size={24} className="inline-block mr-1" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className='p-8 text-center'>Ще ніхто не проходив цей тест.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTestsPage;