'use client';

import ThemeSwitcher from '@/components/shared/ThemeSwitcher';


export default function TestLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex w-full min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className='fixed top-5 right-5 z-50'>
            <ThemeSwitcher/>
      </div>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}