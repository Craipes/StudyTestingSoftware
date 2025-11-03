
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
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { AutoSuggestInput } from './AutoSuggestInput';
import { Label } from '../ui/label';
import StudentCard from './StudentCard';
import { UserInfo } from '@/app/dashboard/(student)/groups/page';


interface Student extends UserInfo {
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

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ groupId, onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { email: '' },
  });

  const { handleSubmit, reset, formState: { errors } } = methods;

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
      <DialogContent className="max-h-[80vh] max-w-[580px] sm:max-w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Керування студентами</DialogTitle>
          <DialogDescription>Додавайте або видаляйте студентів з цієї групи.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleAddStudent)} className="space-y-4 mb-4">
            <div className="flex gap-2 items-center">
              <div className='flex-1'>
                 <AutoSuggestInput
                  name="email"
                  placeholder="Введіть email студента"
                  label="Email студента"
                />
                 {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit">Додати</Button>
            </div>
          </form>
        </FormProvider>

        {loading ? (
          <p>Завантаження списку студентів...</p>
        ) : students.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Студенти групи:</h3>
            {students.map((student, index) => (
              <div key={student.id} className="flex items-center w-full justify-between p-3 border rounded-md dark:bg-input/30 ">
                <StudentCard student={student} index={index} />
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