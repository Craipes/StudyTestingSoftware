'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios'; 
import toast from 'react-hot-toast';
import { ArrowLeft, Users, FileText, User, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/shared/BreadCrumbs';


interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
}

interface GroupTestPreview {
  id: string;
  name: string;
  description: string;
  accessMode: number;
  isPublished: boolean;
  isOpened: boolean;
  hasCloseTime: boolean;
  closeAt: string;
  questionsCount: number;
  durationInMinutes: number;
  attemptsLimit: number;
  usedAttemptsCount: number;
}

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  owner: UserInfo;
  students: UserInfo[];
  tests: GroupTestPreview[];
}

interface GroupPreview {
  id: string;
  name: string;
  description: string;
  availableTestsCount: number;
  unfinishedTestsCount: number;
}

const breadcrumbItems = [
  { name: 'Дашборд', href: '/dashboard' },
  { name: 'Мої групи'}
];

const RenderGroupList = ({ 
  groups, 
  onSelect 
}: { 
  groups: GroupPreview[], 
  onSelect: (id: string) => void 
}) => (
  <div>
    <div className="sm:flex flex-row justify-between items-center mb-6">
        <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0'>Мої групи
           <Breadcrumbs items={breadcrumbItems} />
            </h1>
            <Link
            href={'/dashboard/tests'}
             className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
    >
              Всі тести
    </Link>
    </div>
    {groups.length === 0 ? (
      <p className="text-gray-600 dark:text-gray-400">Вас ще не додали до жодної групи.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div 
            key={group.id} 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelect(group.id)}
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{group.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 h-12 overflow-hidden text-ellipsis">{group.description}</p>
            <div className="border-t dark:border-gray-700 pt-4 flex justify-between items-center text-sm">
              <div className='flex flex-col'>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Доступно тестів: {group.availableTestsCount}
                </span>
                {group.unfinishedTestsCount > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    Незавершених: {group.unfinishedTestsCount}
                  </span>
                )}
              </div>
              <ChevronRight size={24} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


const RenderGroupDetails = ({ 
  group, 
  onBack 
}: { 
  group: GroupDetails, 
  onBack: () => void 
}) => (
  <div>
    <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
      <ArrowLeft size={16} />
      Назад до списку груп
    </button>
    
    {/* Загальна інформація про групу */}
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{group.name}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{group.description}</p>
      <div className="flex items-center gap-2 text-md">
        <User size={18} className="text-gray-500" />
        <strong className="dark:text-gray-300">Викладач:</strong>
        <span className="dark:text-gray-100">{group.owner.lastName} {group.owner.firstName} {group.owner.middleName}</span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Cписок тестів */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 dark:text-gray-100">
          <FileText />
          Тести групи
        </h2>
        <div className="space-y-4">
          {group.tests.length > 0 ? group.tests.map(test => (
            <div key={test.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div className='mb-4 sm:mb-0'>
                  <h3 className="text-xl font-semibold dark:text-gray-100">{test.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{test.description}</p>
                </div>
                {test.isOpened ? (
                  <Link href={`/testing/test/${test.id}`}
                     className="px-4 py-2 text-center w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Почати
                  </Link>
                ) : (
                   <span className="px-4 py-2 text-center w-full sm:w-auto bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed">
                    Закрито
                   </span>
                )}
              </div>
              <div className="border-t dark:border-gray-700 mt-4 pt-4 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
                <p><strong>Питань:</strong> {test.questionsCount}</p>
                <p><strong>Тривалість:</strong> {test.durationInMinutes} хв.</p>
                <p><strong>Спроби:</strong> {test.usedAttemptsCount} / {test.attemptsLimit === 0 ? 'Необмежено' : test.attemptsLimit}</p>
                {test.hasCloseTime && (
                   <p className="text-red-500"><strong>Закриється:</strong> {new Date(test.closeAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">У цій групі ще немає доступних тестів.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cписок учасників */}
      <div className="lg:col-span-1">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 dark:text-gray-100">
          <Users />
          Учасники
        </h2>
        <ul className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
          {group.students.map(student => (
            <li key={student.id} className="py-3 flex items-center gap-3">
              {/* аватар-заглушка */}
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <span className='dark:text-gray-100'>{student.lastName} {student.firstName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const StudentGroupsPage = () => {
  const [groups, setGroups] = useState<GroupPreview[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  useEffect(() => {
    async function fetchGroups() {
      setLoadingGroups(true);
      try {
        const response = await api.get('/student/groups/list-previews');
        setGroups(response.data);
      } catch (err) {
        toast.error('Помилка при завантаженні ваших груп.');
      } finally {
        setLoadingGroups(false);
      }
    }
    fetchGroups();
  }, []);

  const handleSelectGroup = async (groupId: string) => {
    setLoadingDetails(true);
    setSelectedGroup(null); 
    try {
      const response = await api.get(`/student/groups/${groupId}`);
      setSelectedGroup(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні деталей групи.');
    } finally {
      setLoadingDetails(false);
    }
  };
  const handleGoBack = () => {
    setSelectedGroup(null);
  };


  return (
    <div className="flex-1 pt-6 sm:p-8">
      {loadingGroups ? (
        <div className="text-center p-12">Завантаження ваших груп...</div>
      ) : loadingDetails ? (
        <div className="text-center p-12">Завантаження деталей групи...</div>
      ) : selectedGroup ? (
        <RenderGroupDetails group={selectedGroup} onBack={handleGoBack} />
      ) : (
        <RenderGroupList groups={groups} onSelect={handleSelectGroup} />
      )}
    </div>
  );
};

export default StudentGroupsPage;