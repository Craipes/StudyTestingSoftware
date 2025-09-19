'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Схема валідації для форми
const formSchema = z.object({
  oldPassword: z.string().min(1, { message: 'Старий пароль не може бути порожнім.' }),
  newPassword: z.string().min(6, { message: 'Новий пароль повинен містити не менше 6 символів.' }),
  confirmPassword: z.string().min(1, { message: 'Підтвердження пароля не може бути порожнім.' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Паролі не співпадають.',
  path: ['confirmPassword'],
});

type ChangePasswordFormValues = z.infer<typeof formSchema>;

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
  loading: boolean;
  error?: string;
}

export function ChangePasswordForm({ onSubmit, loading, error }: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="oldPassword" className="block dark:text-gray-400 text-sm font-medium text-gray-700 mb-1">
          Старий пароль:
        </label>
        <input
          type="password"
          id="oldPassword"
          {...form.register('oldPassword')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        />
        {form.formState.errors.oldPassword && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.oldPassword.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="newPassword" className="dark:text-gray-400 block text-sm font-medium text-gray-700 mb-1">
          Новий пароль:
        </label>
        <input
          type="password"
          id="newPassword"
          {...form.register('newPassword')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        />
        {form.formState.errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.newPassword.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="dark:text-gray-400 block text-sm font-medium text-gray-700 mb-1">
          Підтвердження нового пароля:
        </label>
        <input
          type="password"
          id="confirmPassword"
          {...form.register('confirmPassword')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        />
        {form.formState.errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
      >
        {loading ? <Loader className="animate-spin" size={20} /> : 'Змінити пароль'}
      </button>
    </form>
  );
}