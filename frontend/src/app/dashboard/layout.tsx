'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { Sidebar } from '@/components/shared/SideBar';
import { getUser } from '@/lib/api';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';

interface UserInfo {
  firstName: string;
  lastName: string;
  isTeacher: boolean;
  isStudent: boolean;
  level:number;
  experience:number;
  requiredExperience:number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const data = await getUser();
        setUserInfo(data);
      } catch (err) {
        toast.error('Сесія застаріла. Будь ласка, увійдіть знову.');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchUserInfo();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-spin">
        <Loader size={36} />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-100 dark:bg-slate-900">
      <Sidebar userInfo={userInfo} />
      <div className='fixed top-5 right-5 z-50'>
            <ThemeSwitcher/>
      </div>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
