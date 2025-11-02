'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from 'next/image';

import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

import { Lock,SquarePlus,Layers,NotebookPen,BookOpen,DoorOpen,Menu, Users, LayoutDashboard, ShoppingBag, BadgeEuro   } from 'lucide-react';
import { RevealWrapper } from 'next-reveal';
import { useUser } from '@/app/dashboard/layout';

const BACKEND_API=process.env.NEXT_PUBLIC_API_URL

export function Sidebar() {
  const router = useRouter();
  const { userInfo, isLoading } = useUser();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <>
      {  !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="cursor-pointer fixed top-4 left-4 z-50 xl:hidden p-2 rounded-md bg-gray-800 text-white dark:bg-slate-950"
        >
          <Menu size={24} />
        </button>
      )}

      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0  bg-opacity-100 z-30 xl:hidden"
        />
      )}

    <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:relative xl:translate-x-0 transition-transform duration-300 ease-in-out w-[70%] md:w-[40%] xl:w-80 bg-gray-800 dark:bg-slate-950 text-white flex flex-col justify-between z-40`}>
      <div className=''>
        {/* Блок з інформацією про користувача */}
          <RevealWrapper delay={100} origin='left' duration={500}>
            <div
              className='relative border-b border-gray-700 pb-4 mb-4 bg-cover bg-center'
              style={{
                backgroundImage: userInfo?.backgroundUrl
                  ? `url(${BACKEND_API}${userInfo.backgroundUrl})`
                  : 'none',
              }}
            >
              {/* Опціональний оверлей для кращої читабельності тексту поверх фону */}
              {userInfo?.backgroundUrl && (
                <div className='absolute inset-0 bg-black/40 z-0' />
              )}

              <div className='relative z-10 flex flex-row gap-4 justify-center items-center px-4 pt-4 mb-4'>
                
                {/* Блок Аватара та Рамки */}
                {userInfo?.avatarUrl && (
                <div className='relative w-14 h-14 my-auto flex justify-center items-center rounded-full flex-shrink-0'>
                    <Image
                      unoptimized={true}
                      src={`${BACKEND_API}${userInfo.avatarUrl}`}
                      alt={`${userInfo.firstName} ${userInfo.lastName} avatar`}
                      width={42}
                      height={42}
                      style={{ objectFit: 'cover' }}
                      className='rounded-full'
                    />
                    {userInfo.avatarFrameUrl && (
                      <Image
                        unoptimized={true}
                        src={`${BACKEND_API}${userInfo.avatarFrameUrl}`}
                        alt='Avatar Frame'
                        fill
                        className='absolute inset-0 z-10'
                      />
                    )}
                  </div>
                )}

                {/* Інформація про користувача (Ім'я, Ролі) */}
                <div className='flex flex-col items-center'>
                  <p className='font-bold text-xl'>
                    {userInfo?.firstName} {userInfo?.lastName}
                  </p>
                  <p className='text-sm text-gray-400 mt-1'>{getRoles()}</p>
                </div>

                {/* Рівень */}
                <div className='my-auto'>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className='rounded-full border-2 border-green-500 px-4 py-2'>
                        {userInfo?.level || 0}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {userInfo?.experience.toFixed(0) || 0} /{' '}
                        {userInfo?.requiredExperience.toFixed(0) || 0} до наступного рівня
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

                 {/* Монети */}
                <div className='flex items-center absolute z-11 bottom-2 left-8'>
                  <BadgeEuro color='#f1a903' className='mr-1' />
                  <span>{userInfo?.coins.toFixed(0) || 0}</span>
                </div>
            </div>
          </RevealWrapper>

        {/* Навігаційне меню */}
        <RevealWrapper delay={100} origin='left' duration={500}>
        <nav className="flex-1 space-y-2 px-4">
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
                  <Link href="/dashboard/groups" className={`py-1 px-2  flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/groups' ? 'bg-gray-700 font-bold' : ''}`}><Users /> Мої групи</Link>
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
                  <Link href="/dashboard/manage-groups" className={`py-1 px-2  flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/manage-groups' ? 'bg-gray-700 font-bold' : ''}`}><LayoutDashboard  /> Керування групами</Link>
                </div>
              )}
            </div>
          )}

          {/* Меню "Загальне" */}
          <div>
            <button
              onClick={() => toggleMenu('profile')}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <span>Загальне</span>
              <span className={`transform transition-transform duration-200 ${openMenus.profile ? 'rotate-90' : 'rotate-0'}`}>&gt;</span>
            </button>
            {openMenus.profile && (
              <div className="flex flex-col pl-6 mt-1 space-y-1">
                <Link href="/dashboard/change-password" className={`py-1 px-2 flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/change-password' ? 'bg-gray-700 font-bold' : ''}`}><Lock /> Змінити пароль</Link>
                <Link href="/dashboard/store" className={`py-1 px-2 flex items-center gap-2 rounded hover:bg-gray-700 transition-colors ${pathname === '/dashboard/store' ? 'bg-gray-700 font-bold' : ''}`}><ShoppingBag />Крамниця</Link>
              </div>
            )}
          </div>

            <div className='border-b border-gray-700 pb-4 mb-4'/>
          
            {/* Кнопка "Вийти" */}
            <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 cursor-pointer rounded hover:bg-gray-700 font-bold"
            >
                <DoorOpen className="inline mr-2" />
                Вийти
            </button>
        </nav>
        </RevealWrapper>
      </div>
    </aside>
    </>
  );
}