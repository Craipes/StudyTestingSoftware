'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Eye, Users } from 'lucide-react';

interface TestPreview {
  id: string;
  name: string;
  isPublished: boolean;
  questionsCount: number;
  accessMode: number;
}

interface GroupTest {
  id: string;
  name: string;
}

interface StudentAttempt {
  userInfo: {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string;
    level: number;
    experience: number;
    requiredExperience: number;
    avatarUrl: string;
    avatarFrameUrl: string;
    backgroundUrl: string;
  };
  attemptsCount: number;
  bestScore: number;
  lastAttemptAt: string;
}

interface GroupTestAttempts {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
  totalPoints: number;
  isPublished: boolean;
  isOpened: boolean;
  accessMode: number;
  durationInMinutes: number;
  attemptsLimit: number;
  hasCloseTime: boolean;
  closeAt: string;
  users: StudentAttempt[];
  totalPagesCount: number;
}

interface ManageTestsModalProps {
  groupId: string;
  onClose: () => void;
}

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

const getPublicationStatusText = (test: TestPreview) => {
  return test.isPublished ? 'Опубліковано' : 'Не опубліковано';
};

const ManageTestsModal: React.FC<ManageTestsModalProps> = ({
  groupId,
  onClose,
}) => {
  const [availableTests, setAvailableTests] = useState<TestPreview[]>([]);
  const [assignedTests, setAssignedTests] = useState<GroupTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [attemptsData, setAttemptsData] = useState<GroupTestAttempts | null>(null);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    async function fetchTests() {
      try {
        const allTestsResponse = await api.get('/teacher/tests/list-previews');
        setAvailableTests(allTestsResponse.data);
        const assignedTestsResponse = await api.get(
          `/teacher/groups/list-tests/${groupId}`,
        );
        setAssignedTests(assignedTestsResponse.data);
      } catch (err) {
        toast.error('Помилка при завантаженні списку тестів.');
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, [groupId]);

  const handleToggleTest = async (testId: string) => {
    const isTestAssigned = assignedTests.some((test) => test.id === testId);

    try {
      if (isTestAssigned) {
        await api.delete(`/teacher/groups/remove-test/${groupId}`, {
          params: { testId },
        });
        setAssignedTests((prev) => prev.filter((test) => test.id !== testId));
        toast.success('Тест успішно видалено з групи.');
      } else {
        await api.post(`/teacher/groups/add-test/${groupId}`, null, {
          params: { testId },
        });
        const testToAdd = availableTests.find((test) => test.id === testId);
        if (testToAdd) {
          setAssignedTests((prev) => [
            ...prev,
            { id: testToAdd.id, name: testToAdd.name },
          ]);
        }
        toast.success('Тест успішно додано до групи.');
      }
    } catch (err) {
      toast.error('Помилка при оновленні списку тестів.');
    }
  };

  const handleViewAttempts = async (testId: string) => {
    setSelectedTestId(testId);
    setAttemptsLoading(true);
    setCurrentPage(1);

    try {
      const response = await api.get(
        `/teacher/tests/view-group/${testId}/${groupId}`,
        {
          params: {
            page: 1,
            pageSize: pageSize
          }
        }
      );
      setAttemptsData(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні спроб студентів.');
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!selectedTestId) return;

    setCurrentPage(page);
    setAttemptsLoading(true);

    try {
      const response = await api.get(
        `/teacher/tests/view-group/${selectedTestId}/${groupId}`,
        {
          params: {
            page: page,
            pageSize: pageSize
          }
        }
      );
      setAttemptsData(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні спроб студентів.');
    } finally {
      setAttemptsLoading(false);
    }
  };

  const closeAttemptsView = () => {
    setSelectedTestId(null);
    setAttemptsData(null);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-[850px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Керування тестами для групи</DialogTitle>
          <DialogDescription>
            Призначайте або видаляйте тести для цієї групи.
          </DialogDescription>
        </DialogHeader>

        {selectedTestId ? (
          // Перегляд спроб студентів
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Спроб студентів: {attemptsData?.name}
              </h3>
              <Button onClick={closeAttemptsView} variant="outline" size="sm">
                Назад до списку
              </Button>
            </div>

            {attemptsLoading ? (
              <p>Завантаження спроб...</p>
            ) : (
              <div className="space-y-4">
                {attemptsData?.users && attemptsData.users.length > 0 ? (
                  <>
                    <div className="grid grid-cols-12 gap-4 px-3 py-2 text-sm font-semibold text-muted-foreground border-b">
                      <div className="col-span-4">Студент</div>
                      <div className="col-span-2 text-center">Спроб</div>
                      <div className="col-span-2 text-center">Найкращий результат</div>
                      <div className="col-span-4 text-center">Остання спроба</div>
                    </div>

                    {attemptsData.users.map((student) => (
                      <div
                        key={student.userInfo.id}
                        className="grid grid-cols-12 gap-4 p-3 border rounded-md items-center"
                      >
                        <div className="col-span-4">
                          {student.userInfo.lastName} {student.userInfo.firstName} {student.userInfo.middleName}
                        </div>
                        <div className="col-span-2 text-center">
                          {student.attemptsCount}
                        </div>
                        <div className="col-span-2 text-center">
                          {student.bestScore}
                        </div>
                        <div className="col-span-4 text-center text-sm text-muted-foreground">
                          {student.lastAttemptAt ? formatDate(student.lastAttemptAt) : 'Немає спроб'}
                        </div>
                      </div>
                    ))}

                    {/* Пагінація */}
                    {attemptsData.totalPagesCount > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Попередня
                        </Button>
                        <span className="text-sm">
                          Сторінка {currentPage} з {attemptsData.totalPagesCount}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === attemptsData.totalPagesCount}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Наступна
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Немає спроб студентів для цього тесту.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Основний список тестів
          <div className="space-y-4">
            {loading ? (
              <p>Завантаження тестів...</p>
            ) : availableTests.length > 0 ? (
              <>
                <div className="hidden md:grid md:grid-cols-7 items-center gap-x-4 px-3 pt-2">
                  <span className="text-sm font-semibold text-muted-foreground md:col-span-3">
                    Назва тесту
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground md:col-span-1">
                    Питання
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground md:col-span-1">
                    Доступ
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground md:col-span-1">
                    Статус
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground md:col-span-1">
                    Дії
                  </span>
                </div>

                {availableTests.map((test) => {
                  const isAssigned = assignedTests.some(
                    (t) => t.id === test.id,
                  );

                  return (
                    <div
                      key={test.id}
                      className="grid grid-cols-2 md:grid-cols-7 items-center gap-x-4 gap-y-2 p-3 border rounded-md"
                    >
                      <div className="flex items-center space-x-2 col-span-2 md:col-span-3 min-w-0">
                        <Checkbox
                          id={`test-${test.id}`}
                          checked={isAssigned}
                          onCheckedChange={() => handleToggleTest(test.id)}
                        />
                        <Label
                          htmlFor={`test-${test.id}`}
                          className="font-medium truncate"
                        >
                          {test.name}
                        </Label>
                      </div>

                      <span className="text-sm text-muted-foreground md:hidden col-span-1">
                        Питань:
                      </span>
                      <span className="text-sm text-muted-foreground md:col-span-1 col-span-1 text-left md:text-left">
                        ({test.questionsCount} питань)
                      </span>

                      <span className="text-sm text-muted-foreground md:hidden col-span-1">
                        Доступ:
                      </span>
                      <span className="text-sm text-muted-foreground md:col-span-1 col-span-1 whitespace-nowrap text-left md:text-left">
                        {getAccessModeText(test.accessMode)}
                      </span>

                      <span className="text-sm text-muted-foreground md:hidden col-span-1">
                        Статус:
                      </span>
                      <span className="text-sm text-muted-foreground md:col-span-1 col-span-1 whitespace-nowrap text-left md:text-left">
                        {getPublicationStatusText(test)}
                      </span>

                      <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAttempts(test.id)}
                          disabled={!isAssigned}
                          title={isAssigned ? "Переглянути спроби студентів" : "Спочатку призначте тест групі"}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="text-gray-500">У вас ще немає створених тестів.</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Закрити
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTestsModal;