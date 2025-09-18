
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


const formSchema = z.object({
  email: z.string().email({ message: 'Введіть коректну адресу електронної пошти.' }),
  password: z.string().min(1, { message: 'Пароль не може бути порожнім.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => void;
  error?: string;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
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
        <label htmlFor="email" className="block text-sm dark:text-gray-400 font-medium text-gray-700 mb-1">
          Email:
        </label>
        <input
          type="email"
          id="email"
          {...form.register('email')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm dark:text-gray-400 font-medium text-gray-700 mb-1">
          Пароль:
        </label>
        <input
          type="password"
          id="password"
          {...form.register('password')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
      >
        Увійти
      </button>
    </form>
  );
}