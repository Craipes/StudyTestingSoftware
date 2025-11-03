import { UserInfo } from '@/app/dashboard/(student)/groups/page'
import { RevealWrapper } from 'next-reveal'
import React from 'react'
import Image from 'next/image'
import { getLevelColor } from '@/utils/colors-for-level'


const BACKEND_API = process.env.NEXT_PUBLIC_API_URL;



export const StudentCard = ({student, index}: {student: UserInfo, index: number}) => {
  return (
              <RevealWrapper className={'w-full'} key={student.id} delay={index * 100} duration={500} origin="top" distance="20px" reset={false}>
            <div 
              className="relative p-3 mb-2 rounded-lg overflow-hidden flex items-center gap-3 transition-colors duration-200"
              style={{
                backgroundImage: student.backgroundUrl ? `url(${BACKEND_API}${student.backgroundUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {student.backgroundUrl && (
                <div className="absolute inset-0 bg-black/30 z-0" />
              )}

              <div className="relative z-10 flex items-center gap-3 w-full">
                {student.avatarUrl ? (
                  <div className='relative w-10 h-10 my-auto flex justify-center items-center rounded-full flex-shrink-0'>
                    <Image
                      unoptimized={true}
                      src={`${BACKEND_API}${student.avatarUrl}`}
                      alt={`${student.firstName} ${student.lastName} avatar`}
                      width={32}
                      height={32}
                      style={{ objectFit: 'cover' }}
                      className='rounded-full'
                    />
                    {student.avatarFrameUrl && (
                      <Image
                        unoptimized={true}
                        src={`${BACKEND_API}${student.avatarFrameUrl}`}
                        alt='Avatar Frame'
                        fill
                        className='absolute inset-0 z-10'
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                )}
                
                <span className='font-medium text-gray-100 text-shadow-sm flex-grow'>
                  {student.lastName} {student.firstName}
                </span>

                {student.level !== undefined && (
                  <div 
                    className="flex-shrink-0 rounded-full px-2 py-1 text-xs font-bold text-black shadow-sm"
                    style={{ backgroundColor: getLevelColor(student.level) }}
                  >
                    {student.level}
                  </div>
                )}
              </div>
            </div>
          </RevealWrapper>
  )
}

export default StudentCard