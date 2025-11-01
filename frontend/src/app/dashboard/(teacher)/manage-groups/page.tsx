'use client';

import api from '@/lib/axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, Trash, Users, Book } from 'lucide-react';
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


import Breadcrumbs from '@/components/shared/BreadCrumbs';
import ManageStudentsModal from '@/components/shared/ManageStudentsModal';
import ManageTestsModal from '@/components/shared/ManageTestsModal';
import GroupFormModal from '@/components/shared/GroupFormModal';
import { GroupPreview } from '@/types/manage-groups-types';
import { RevealWrapper } from 'next-reveal';

const ManageGroupsPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupPreview[]>([]);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupPreview | null>(null);

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/teacher/dashboard' },
    { name: 'Керування групами' },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/groups/list-previews');
      setGroups(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні груп.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroupId) return;
    try {
      await api.delete(`/teacher/groups/delete/${deletingGroupId}`);
      setGroups((prev) => prev.filter((group) => group.id !== deletingGroupId));
      toast.success('Групу успішно видалено.');
    } catch (err) {
      toast.error('Помилка при видаленні групи.');
    } finally {
      setDeletingGroupId(null);
    }
  };

  const handleOpenFormModal = (group?: GroupPreview) => {
    setSelectedGroup(group || null);
    setIsFormModalOpen(true);
  };
  const handleOpenStudentsModal = (group: GroupPreview) => {
    setSelectedGroup(group);
    setIsStudentsModalOpen(true);
  };
  const handleOpenTestsModal = (group: GroupPreview) => {
    setSelectedGroup(group);
    setIsTestsModalOpen(true);
  };

  return (
    <div className='flex-1 pt-6 sm:p-8'>
      <div className="sm:flex flex-row  justify-between items-center mb-6">
        <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0'>Керування групами
    <Breadcrumbs items={breadcrumbItems} />
        </h1>
        <button
          onClick={() => handleOpenFormModal()}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
        >
          Створити групу
        </button>
      </div>

      {loading ? (
        <div>Завантаження груп...</div>
      ) : groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group, index) => (
            <RevealWrapper key={group.id} delay={index * 40} duration={500} origin="top" distance="20px" reset={true}>
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{group.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{group.studentsCount} {group.studentsCount === 1 ? 'студент' : 'студентів'}</span>
                  </div>
                  <div className="flex items-center">
                    <Book size={16} className="mr-1" />
                    <span>{group.testsCount} {group.testsCount === 1 ? 'тест' : 'тестів'}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenStudentsModal(group)}
                  className="p-2 rounded-md text-green-500 hover:bg-green-100 dark:hover:bg-gray-700"
                  title="Керувати студентами"
                >
                  <Users size={20} />
                </button>
                <button
                  onClick={() => handleOpenTestsModal(group)}
                  className="p-2 rounded-md text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700"
                  title="Керувати тестами"
                >
                  <Book size={20} />
                </button>
                <button
                  onClick={() => handleOpenFormModal(group)}
                  className="p-2 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                  title="Редагувати групу"
                >
                  <Edit size={20} />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-gray-700"
                      onClick={() => setDeletingGroupId(group.id)}
                      title="Видалити групу"
                    >
                      <Trash size={20} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити групу "{group.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію неможливо скасувати. Це назавжди видалить групу та всі пов'язані дані.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletingGroupId(null)}>Скасувати</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteGroup}>Видалити</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            </RevealWrapper>
          ))}
        </div>
      ) : (
        <div>У вас ще немає створених груп.</div>
      )}

      {isStudentsModalOpen && selectedGroup && (
        <ManageStudentsModal
          groupId={selectedGroup.id}
          onClose={() => setIsStudentsModalOpen(false)}
        />
      )}
      {isTestsModalOpen && selectedGroup && (
        <ManageTestsModal
          groupId={selectedGroup.id}
          onClose={() => setIsTestsModalOpen(false)}
        />
      )}
      {isFormModalOpen && (
        <GroupFormModal
          group={selectedGroup}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={fetchGroups}
        />
      )}
    </div>
  );
};

export default ManageGroupsPage;