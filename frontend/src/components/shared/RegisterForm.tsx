'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


const formSchema = z.object({
  firstName: z.string().min(2, { message: 'Ім’я повинно містити щонайменше 2 символи.' }),
  lastName: z.string().min(2, { message: 'Прізвище повинно містити щонайменше 2 символи.' }),
  middleName: z.string().optional(),
  email: z.string().email({ message: 'Введіть коректну адресу електронної пошти.' }),
  password: z.string().min(6, { message: 'Пароль повинен містити щонайменше 6 символів.' }),
  isTeacher: z.boolean(),
  isStudent: z.boolean(),
}).refine(data => data.isStudent || data.isTeacher, {
  message: "Будь ласка, оберіть хоча б одну роль.",
  path: ["isStudent"],
});

type RegisterFormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => void;
  error?: string;
}

export function RegisterForm({ onSubmit, error }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      isTeacher: false,
      isStudent: true,
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Ім’я:</label>
        <input
          {...form.register('firstName')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        {form.formState.errors.firstName && <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Прізвище:</label>
        <input
          {...form.register('lastName')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        {form.formState.errors.lastName && <p className="mt-1 text-sm text-red-600">{form.formState.errors.lastName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">По батькові:</label>
        <input
          {...form.register('middleName')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
        <input
          type="email"
          {...form.register('email')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        {form.formState.errors.email && <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль:</label>
        <input
          type="password"
          {...form.register('password')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        {form.formState.errors.password && <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>}
      </div>
      
      <div className="flex flex-col space-y-2">
        <p className="block text-sm font-medium text-gray-700">Оберіть роль або ролі:</p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isStudent"
              {...form.register('isStudent')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isStudent" className="ml-2 text-sm font-medium text-gray-900">Студент</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTeacher"
              {...form.register('isTeacher')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isTeacher" className="ml-2 text-sm font-medium text-gray-900">Викладач</label>
          </div>
        </div>
        {form.formState.errors.isStudent && !form.formState.errors.isTeacher && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.isStudent.message}</p>
        )}
      </div>
      
      <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300">
        Зареєструватися
      </button>
    </form>
  );
}