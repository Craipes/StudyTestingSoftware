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

import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash,
  Folder,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';
import {
  TestDetails,
  TestPreview,
  UserSessionDetails,
} from '@/types/manage-tests-types';
import { convertUtcStringToKyiv } from '@/utils/parse-date';
import { RevealWrapper } from 'next-reveal';


export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
  TableSingleChoice = 2,
  Ordering = 3,
  Slider = 4,
  YesNo = 5,
}

interface ChoiceOption {
  id: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
}

interface QuestionRow {
  id: string;
  text: string;
  selectedColumnId: string;
  correctColumnId: string;
}

interface QuestionColumn {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  points: number;
  questionType: QuestionType;
  receivedScore: number;
  minNumberValue?: number;
  maxNumberValue?: number;
  numberValueStep?: number;
  selectedNumberValue?: number;
  selectedBooleanValue?: boolean;
  validNumberValue?: number;
  validBooleanValue?: boolean;
  questionRows?: QuestionRow[];
  questionColumns?: QuestionColumn[];
  choiceOptions?: ChoiceOption[];
}

interface SessionDetails {
  id: string;
  testName: string;
  startedAt: string;
  finishedAt: string;
  autoFinishAt: string;
  score: number;
  isCompleted: boolean;
  durationInMinutes: number;
  maxScore: number;
  questions: Question[];
}

const QuestionRenderer = ({ question }: { question: Question }) => {
  const getOptionStyle = (option: ChoiceOption) => {
    if (option.isSelected && option.isCorrect) {
      return 'text-green-600 font-bold';
    }
    if (option.isSelected && !option.isCorrect) {
      return 'text-red-600 font-bold';
    }
    if (!option.isSelected && option.isCorrect) {
      return 'text-green-600';
    }
    return 'dark:text-gray-300';
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
        return (
          <ul className="space-y-2">
            {question.choiceOptions?.map((option) => (
              <li
                key={option.id}
                className={`flex items-center gap-2 ${getOptionStyle(option)}`}
              >
                {option.isSelected && option.isCorrect && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                {option.isSelected && !option.isCorrect && (
                  <XCircle size={16} className="text-red-600" />
                )}
                {!option.isSelected && option.isCorrect && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                <span>{option.text}</span>
              </li>
            ))}
          </ul>
        );

      case QuestionType.TableSingleChoice:
      case QuestionType.Ordering:
        return (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Рядок
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Відповідь студента
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Правильна відповідь
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {question.questionRows?.map((row) => {
                const selectedColumn = question.questionColumns?.find(
                  (c) => c.id === row.selectedColumnId,
                );
                const correctColumn = question.questionColumns?.find(
                  (c) => c.id === row.correctColumnId,
                );
                const isCorrect = row.selectedColumnId === row.correctColumnId;
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-2">{row.text}</td>
                    <td
                      className={`px-4 py-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedColumn?.text || 'Немає відповіді'}
                    </td>
                    <td className="px-4 py-2 text-green-600">
                      {correctColumn?.text}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );

      case QuestionType.Slider:
        const isSliderCorrect =
          question.selectedNumberValue === question.validNumberValue;
        return (
          <div className="flex gap-4">
            <p>
              Відповідь студента:{' '}
              <span
                className={
                  isSliderCorrect
                    ? 'font-bold text-green-600'
                    : 'font-bold text-red-600'
                }
              >
                {question.selectedNumberValue}
              </span>
            </p>
            <p>
              Правильна відповідь:{' '}
              <span className="font-bold text-green-600">
                {question.validNumberValue}
              </span>
            </p>
          </div>
        );

      case QuestionType.YesNo:
        const isYesNoCorrect =
          question.selectedBooleanValue === question.validBooleanValue;
        const studentAnswer = question.selectedBooleanValue ? 'Так' : 'Ні';
        const correctAnswer = question.validBooleanValue ? 'Так' : 'Ні';
        return (
          <div className="flex gap-4">
            <p>
              Відповідь студента:{' '}
              <span
                className={
                  isYesNoCorrect
                    ? 'font-bold text-green-600'
                    : 'font-bold text-red-600'
                }
              >
                {studentAnswer}
              </span>
            </p>
            <p>
              Правильна відповідь:{' '}
              <span className="font-bold text-green-600">{correctAnswer}</span>
            </p>
          </div>
        );

      default:
        return <p>Невідомий тип питання.</p>;
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg dark:text-gray-100">
          {question.text}
        </h4>
        <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {question.receivedScore} / {question.points}
        </span>
      </div>
      <div className="mt-2 text-sm">{renderQuestionContent()}</div>
    </div>
  );
};

const PAGE_SIZE = 10;

const ManageTestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<TestPreview[]>([]);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestDetails | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] =
    useState<UserSessionDetails | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [isSessionDetailsModalOpen, setIsSessionDetailsModalOpen] =useState(false);
  const [loadingSessionDetails, setLoadingSessionDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Керування тестами' },
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
      setTests((prevTests) =>
        prevTests.filter((test) => test.id !== deletingTestId),
      );
      toast.success('Тест успішно видалено.');
    } catch (err) {
      toast.error('Помилка при видаленні тесту.');
    } finally {
      setDeletingTestId(null);
    }
  };

  const handleSessionDetails = async (sessionId: string) => {
    setIsSessionDetailsModalOpen(true);
    setLoadingSessionDetails(true);
    try {
      const response = await api.get(`/teacher/tests/view-session/${sessionId}`);
      setSession(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні деталей сесії.');
      setIsSessionDetailsModalOpen(false);
    } finally {
      setLoadingSessionDetails(false);
    }
  };

  const handleOpenSessions = async (testId: string) => {
    setIsSessionsModalOpen(true);
    setLoadingSessions(true);
    setSelectedUserSessions(null);
    setCurrentPage(1); 
    try {
      const response = await api.get(`/teacher/tests/view/${testId}`, {
        params: {
          page: 1,
          pageSize: PAGE_SIZE,
        },
      });
      setSelectedTest(response.data);
      setTotalPages(response.data.totalPagesCount); 
    } catch (err) {
      toast.error('Помилка при завантаженні сесій.');
      setIsSessionsModalOpen(false);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || !selectedTest) return;

    setLoadingSessions(true);
    try {
      const response = await api.get(`/teacher/tests/view/${selectedTest.id}`, {
        params: {
          page: newPage,
          pageSize: PAGE_SIZE,
        },
      });
      setSelectedTest(response.data);
      setCurrentPage(newPage); 
      setTotalPages(response.data.totalPagesCount);
    } catch (err) {
      toast.error('Помилка при завантаженні сторінки.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleViewUserSessions = async (userId: string) => {
    if (!selectedTest) return;
    setLoadingSessions(true);
    try {
      const response = await api.get(
        `/teacher/tests/view/${selectedTest.id}/${userId}`,
      );
      setSelectedUserSessions(response.data);
      console.log('User Sessions:', response.data);
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
      setSelectedUserSessions((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sessions: prev.sessions.filter(
            (session) => session.id !== deletingSessionId,
          ),
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
      case 0:
        return 'Приватний';
      case 1:
        return 'Груповий';
      default:
        return 'Публічний';
    }
  };

  const handleCloseModal = () => {
    setIsSessionsModalOpen(false);
    setSelectedTest(null);
    setSelectedUserSessions(null);
  };

  const handleCloseDetailsModal = () => {
    setIsSessionDetailsModalOpen(false);
    setSession(null);
  };

  return (
    <div>
      {loading ? (
        <div>Завантаження тестів...</div>
      ) : (
        <div className="flex-1 pt-6 sm:p-8">
          <div className="sm:flex flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0">
              Керування тестами
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
              {tests.map((test, index) => (
                <RevealWrapper
                  key={test.id}
                  delay={index * 40}
                  duration={500}
                  origin="top"
                  distance="20px"
                  reset={false}
                >
                  <div
                    key={test.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4"
                  >
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {test.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Питань: {test.questionsCount}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Режим доступу: {getAccessModeText(test.accessMode)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Статус: {getStatusText(test)}
                      </p>
                      {test.hasCloseTime && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Закриття:{' '}
                          {new Date(test.closeAt!).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenSessions(test.id)}
                        title="Переглянути спроби"
                        className="p-2 rounded-md text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700"
                      >
                        <Folder size={20} />
                      </button>
                      <Link
                        title="Редагувати тест"
                        href={`/dashboard/edit-test/${test.id}`}
                        className="p-2 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                      >
                        <Edit size={20} />
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            title="Видалити тест"
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
                              Цю дію неможливо скасувати. Це назавжди видалить
                              тест.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              className="bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white hover:bg-gray-300 hover:dark:bg-gray-900"
                              onClick={() => setDeletingTestId(null)}
                            >
                              Скасувати
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={handleDelete}
                            >
                              Видалити
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </RevealWrapper>
              ))}
            </div>
          ) : (
            <div>У вас ще немає створених тестів.</div>
          )}
        </div>
      )}

      {/* Основне модальне вікно для списків */}
      <Dialog open={isSessionsModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-11/12 max-w-4xl max-h-11/12 overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {selectedUserSessions
                ? `Сесії користувача: ${selectedUserSessions.userInfo.lastName} ${selectedUserSessions.userInfo.firstName}`
                : `Спроби тесту: ${selectedTest?.name || ''}`}
            </DialogTitle>
          </DialogHeader>

          {loadingSessions ? (
            <div className="p-8 text-center">Завантаження...</div>
          ) : (
            <div>
              {selectedUserSessions ? (
                <div>
                  <button
                    onClick={() => setSelectedUserSessions(null)}
                    className="flex items-center gap-2 mb-4 text-sm text-blue-600 hover:underline"
                  >
                    <ArrowLeft size={16} />
                    Назад до списку всіх користувачів
                  </button>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Початок
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Завершення
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Бал
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Статус
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Дії
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedUserSessions.sessions.map((session) => (
                          <tr key={session.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {convertUtcStringToKyiv(session.startedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {session.finishedAt
                                ? convertUtcStringToKyiv(session.finishedAt)
                                : '---'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {session.score.toFixed(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {session.isCompleted ? 'Завершено' : 'В процесі'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() =>
                                  handleSessionDetails(session.id)
                                }
                                className="px-3 py-1 text-sm  text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700"
                                title="Переглянути деталі сесії"
                              >
                                <Eye size={18} className="" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={() =>
                                      setDeletingSessionId(session.id)
                                    }
                                    title="Видалити сесію"
                                    className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-gray-700"
                                  >
                                    <Trash size={18} />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Видалити сесію?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Цю дію неможливо скасувати. Всі дані про
                                      цю спробу буде втрачено.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() =>
                                        setDeletingSessionId(null)
                                      }
                                    >
                                      Скасувати
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 text-white hover:bg-red-700"
                                      onClick={handleDeleteSession}
                                    >
                                      Видалити
                                    </AlertDialogAction>
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
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Користувач
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Кількість спроб
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Найкращий бал
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Дії
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {selectedTest.users.map((userAttempt) => (
                              <tr key={userAttempt.userInfo.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{`${userAttempt.userInfo.lastName} ${userAttempt.userInfo.firstName}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {userAttempt.attemptsCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {userAttempt.bestScore}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() =>
                                      handleViewUserSessions(
                                        userAttempt.userInfo.id,
                                      )
                                    }
                                    className="px-3 py-1 text-sm  text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700"
                                  >
                                    <Eye size={24} className="inline-block" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* ЗМІНА: Додано блок пагінації */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loadingSessions}
                            variant="outline"
                          >
                            Попередня
                          </Button>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Сторінка {currentPage} з {totalPages}
                          </span>
                          <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={
                              currentPage === totalPages || loadingSessions
                            }
                            variant="outline"
                          >
                            Наступна
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      Ще ніхто не проходив цей тест.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальне вікно для деталей сесії */}
      <Dialog
        open={isSessionDetailsModalOpen}
        onOpenChange={handleCloseDetailsModal}
      >
        <DialogContent className="w-11/12 max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Деталі сесії: {session?.testName}</DialogTitle>
          </DialogHeader>
          {loadingSessionDetails ? (
            <div className="flex-grow flex items-center justify-center">
              Завантаження деталей...
            </div>
          ) : session ? (
            <div className="flex-grow overflow-y-auto pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Результат</p>
                  <p className="font-bold text-lg">
                    {session.score} / {session.maxScore}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Початок</p>
                  <p className="font-semibold">
                    {convertUtcStringToKyiv(session.startedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Завершення</p>
                  <p className="font-semibold">
                    {convertUtcStringToKyiv(session.finishedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Статус</p>
                  <p
                    className={`font-bold ${
                      session.isCompleted
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {session.isCompleted ? 'Завершено' : 'В процесі'}
                  </p>
                </div>
              </div>

              <div>
                {session.questions.map((question) => (
                  <QuestionRenderer key={question.id} question={question} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              Не вдалося завантажити дані.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTestsPage;