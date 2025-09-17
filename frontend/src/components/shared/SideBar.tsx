'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

import { Lock,SquarePlus,Layers,NotebookPen,BookOpen,DoorOpen  } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';


interface UserInfo {
  firstName: string;
  lastName: string;
  isTeacher: boolean;
  isStudent: boolean;
}

interface SidebarProps {
  userInfo: UserInfo | null;
}

export function Sidebar({ userInfo }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    student: true,
    teacher: true,
    profile: true,
  });

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    toast.success('Ви успішно вийшли.');
    router.push('/login');
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prevState => ({
      ...prevState,
      [menuName]: !prevState[menuName],
    }));
  };

  const getRoles = () => {
    if (!userInfo) return '';
    const roles = [];
    if (userInfo.isStudent) {
      roles.push('Студент');
    }
    if (userInfo.isTeacher) {
      roles.push('Викладач');
    }
    return roles.length > 0 ? roles.join(' та ') : 'Немає ролі';
  };

  return (
    <aside className="w-70 bg-gray-800 dark:bg-slate-950 text-white p-4 flex flex-col justify-between">
      <div>
        {/* Блок з інформацією про користувача */}
        <div className="flex flex-col items-center border-b border-gray-700 pb-4 mb-4">
          <p className="font-bold text-xl">{userInfo?.firstName} {userInfo?.lastName}</p>
          <p className="text-sm text-gray-400 mt-1">{getRoles()}</p>
        </div>

        {/* Навігаційне меню */}
        <nav className="flex-1 space-y-2">
          {/* Меню "Студент" */}
          {userInfo?.isStudent && (
            <div>
              <button
                onClick={() => toggleMenu('student')}
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <span>Студент</span>
                <span className={`transform transition-transform duration-200 ${openMenus.student ? 'rotate-90' : 'rotate-0'}`}>&gt;</span>
              </button>
              {openMenus.student && (
                <div className="flex flex-col pl-6 mt-1 space-y-1">
                  <Link href="/dashboard/tests" className={`py-1 px-2  flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/tests' ? 'bg-gray-700 font-bold' : ''}`}><BookOpen /> Переглянути тести</Link>
                  <Link href="/dashboard/results" className={`py-1 px-2  flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/results' ? 'bg-gray-700 font-bold' : ''}`}><NotebookPen /> Мої результати</Link>
                </div>
              )}
            </div>
          )}

          {/* Меню "Викладач" */}
          {userInfo?.isTeacher && (
            <div>
              <button
                onClick={() => toggleMenu('teacher')}
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <span>Викладач</span>
                <span className={`transform transition-transform duration-200 ${openMenus.teacher ? 'rotate-90' : 'rotate-0'}`}>&gt;</span>
              </button>
              {openMenus.teacher && (
                <div className="flex flex-col pl-6 mt-1 space-y-1">
                  <Link href="/dashboard/create-test" className={`py-1 px-2  flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/create-test' ? 'bg-gray-700 font-bold' : ''}`}><SquarePlus /> Створити тест</Link>
                  <Link href="/dashboard/manage-tests" className={`py-1 px-2  flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/manage-tests' ? 'bg-gray-700 font-bold' : ''}`}><Layers /> Керування тестами</Link>
                </div>
              )}
            </div>
          )}

          {/* Меню "Профіль" */}
          <div>
            <button
              onClick={() => toggleMenu('profile')}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <span>Профіль</span>
              <span className={`transform transition-transform duration-200 ${openMenus.profile ? 'rotate-90' : 'rotate-0'}`}>&gt;</span>
            </button>
            {openMenus.profile && (
              <div className="flex flex-col pl-6 mt-1 space-y-1">
                <Link href="/dashboard/change-password" className={`py-1 px-2 flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/change-password' ? 'bg-gray-700 font-bold' : ''}`}><Lock /> Змінити пароль</Link>
              </div>
            )}
          </div>

            <div className='border-b border-gray-700 pb-4 mb-4'/>
          
           {/* Кнопка "Вийти" */}
            <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 font-bold"
            >
                <DoorOpen className="inline mr-2" />
                Вийти
            </button>
        </nav>
      </div>
    </aside>
  );
}