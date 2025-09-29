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


interface TestPreview {
  id: string;
  name: string;
  isPublished: boolean;
  questionsCount: number;
  accessMode:number;
}

interface GroupTest {
  id: string;
  name: string;
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
  }

const ManageTestsModal: React.FC<ManageTestsModalProps> = ({ groupId, onClose }) => {
  const [availableTests, setAvailableTests] = useState<TestPreview[]>([]);
  const [assignedTests, setAssignedTests] = useState<GroupTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const allTestsResponse = await api.get('/teacher/tests/list-previews');
        setAvailableTests(allTestsResponse.data);
        const assignedTestsResponse = await api.get(`/teacher/groups/list-tests/${groupId}`);
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
    const isTestAssigned = assignedTests.some(test => test.id === testId);
    
    try {
      if (isTestAssigned) {
        await api.delete(`/teacher/groups/remove-test/${groupId}`, {
          params: { testId },
        });
        setAssignedTests(prev => prev.filter(test => test.id !== testId));
        toast.success('Тест успішно видалено з групи.');
      } else {
        await api.post(`/teacher/groups/add-test/${groupId}`, null, {
          params: { testId },
        });
        const testToAdd = availableTests.find(test => test.id === testId);
        if (testToAdd) {
          setAssignedTests(prev => [...prev, { id: testToAdd.id, name: testToAdd.name }]);
        }
        toast.success('Тест успішно додано до групи.');
      }
    } catch (err) {
      toast.error('Помилка при оновленні списку тестів.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Керування тестами для групи</DialogTitle>
          <DialogDescription>Призначайте або видаляйте тести для цієї групи.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <p>Завантаження тестів...</p>
        ) : (
          <div className="space-y-4">
            {availableTests.length > 0 ? (
              availableTests.map((test) => {
                const isAssigned = assignedTests.some(t => t.id === test.id);
                return (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`test-${test.id}`}
                        checked={isAssigned}
                        onCheckedChange={() => handleToggleTest(test.id)}
                      />
                      <Label htmlFor={`test-${test.id}`} className="font-medium">{test.name}</Label>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({test.questionsCount} питань)
                    </span>
                    <span className="text-sm text-gray-500">
                      {getAccessModeText(test.accessMode)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getPublicationStatusText(test)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">У вас ще немає створених тестів.</p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Закрити</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTestsModal;