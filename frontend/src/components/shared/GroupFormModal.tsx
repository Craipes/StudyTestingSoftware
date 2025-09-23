'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const groupSchema = z.object({
  name: z.string().min(2, "Назва групи має містити від 2 до 100 символів.").max(100, "Назва групи має містити від 2 до 100 символів."),
  description: z.string().max(500, "Опис групи має містити не більше 500 символів.").optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface GroupFormModalProps {
  group?: { id: string; name: string; description: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({ group, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: GroupFormValues) => {
    setLoading(true);
    try {
      if (group) {
        await api.put(`/teacher/groups/edit/${group.id}`, data);
        toast.success('Групу успішно оновлено.');
      } else {
        await api.post('/teacher/groups/create', data);
        toast.success('Групу успішно створено.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Помилка при збереженні групи.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group ? 'Редагувати групу' : 'Створити нову групу'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 gap-2">
          <div>
            <Label className='mb-2' htmlFor="name">Назва групи</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label className='mb-2' htmlFor="description">Опис</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>Скасувати</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupFormModal;