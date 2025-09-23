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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Trash } from 'lucide-react';
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


interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface ManageStudentsModalProps {
  groupId: string;
  onClose: () => void;
}

const studentSchema = z.object({
  email: z.string().email("Невірний формат email").max(100, "Email має містити не більше 100 символів."),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ groupId, onClose}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { email: '' },
  });

  const { register, handleSubmit, reset, formState: { errors } } = form;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teacher/groups/list-students/${groupId}`);
      setStudents(response.data);
    } catch (err) {
      toast.error('Помилка при завантаженні списку студентів.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [groupId]);

  const handleAddStudent = async (data: StudentFormValues) => {
    try {
      await api.post(`/teacher/groups/add-student/${groupId}`, null, {
        params: { useEmail: true, userEmail: data.email },
      });
      toast.success('Студента успішно додано.');
      await fetchStudents(); 
      reset();
    } catch (err) {
      toast.error('Помилка при додаванні студента. Можливо, користувач не існує.');
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    try {
      await api.delete(`/teacher/groups/remove-student/${groupId}`, {
        params: { userId },
      });
      toast.success('Студента успішно видалено.');
      await fetchStudents(); 
    } catch (err) {
      toast.error('Помилка при видаленні студента.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Керування студентами</DialogTitle>
          <DialogDescription>Додавайте або видаляйте студентів з цієї групи.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleAddStudent)} className="space-y-4 mb-4 flex gap-2 items-center">
          <div className="flex-1">
            <Label className='mb-2' htmlFor="email">Email студента</Label>
            <div className='flex gap-2'>
              <Input
              id="email"
              type="email"
              placeholder="Введіть email студента"
              {...register('email')}
            />
              <Button type="submit" className="mt-auto">Додати</Button>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </form>

        {loading ? (
          <p>Завантаження списку студентів...</p>
        ) : students.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Студенти групи:</h3>
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-md dark:bg-input/30 ">
                <span className="text-gray-900  dark:text-gray-100">{student.firstName} {student.lastName}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700">
                      <Trash size={20} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити студента?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ви впевнені, що хочете видалити студента {student.firstName} {student.lastName} з цієї групи?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveStudent(student.id)}>Видалити</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">У цій групі ще немає студентів.</p>
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="outline">Закрити</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageStudentsModal;