'use client';

import { useEffect, useState,useCallback, useContext,createContext } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { Sidebar } from '@/components/shared/SideBar';
import { getActiveTestSession, getUser } from '@/lib/api';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';


interface UserInfo {
  firstName: string;
  lastName: string;
  isTeacher: boolean;
  isStudent: boolean;
  level:number;
  avatarUrl?:string;
  backgroundUrl?:string;
  avatarFrameUrl?:string;
  experience:number;
  requiredExperience:number;
  coins:number;
}

interface UserContextType {
  userInfo: UserInfo | null;
  isLoading: boolean;
  refetchUserInfo: () => void; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a DashboardLayout');
  }
  return context;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

const fetchUserInfo = useCallback(async () => {
    try {
      const data = await getUser();
      setUserInfo(data);
    } catch (err) {
      toast.error('Сесія застаріла. Будь ласка, увійдіть знову.');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      router.push('/login');
    } finally {
      if (loading) setLoading(false);
    }
  }, [router, loading]);


  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]); 

      const [activeSession,setActiveSession]=useState<null | {
          id:string;
          testName:string;
          startedAt:string;
          autoFinishAt:string;
          durationInMinutes:number;
        }>(null);
        const [loadingActiveSession,setLoadingActiveSession]=useState(true);
      
        useEffect(() => {
          async function fetchActiveTestSession() {
            try {
              const response = await getActiveTestSession();
              setActiveSession(response);
              if(response!==null && response.id){
                toast.error('У вас вже є активна тестова сесія. Ви будете перенаправлені на панель керування.');  
                setTimeout(() => {
                  router.push('/dashboard');
                }, 3000);
              }
            } catch (err) {
            } finally {
              setLoadingActiveSession(false);
            }
          }
          fetchActiveTestSession();
        }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-spin">
        <Loader size={36} />
      </div>
    );
  }

  const contextValue = {
    userInfo,
    isLoading: loading,
    refetchUserInfo: fetchUserInfo, 
  };

  return (
    <UserContext.Provider value={contextValue}>
    <div className="flex w-full min-h-screen bg-gray-100 dark:bg-slate-900">
      <Sidebar/>
      <div className='fixed top-5 right-5 z-50'>
            <ThemeSwitcher/>
      </div>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
    </UserContext.Provider>
  );
}
