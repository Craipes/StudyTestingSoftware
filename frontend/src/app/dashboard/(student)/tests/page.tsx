
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {  AvailableTestsResponse } from '@/types';
import { fetchAvailableTests } from '@/lib/api';
import { TestCard } from '@/components/shared/TestCard';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';
import { RevealList, RevealWrapper } from 'next-reveal';

const PAGE_SIZE = 6;

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Доступні тести'}
  ];


export default function StudentTestsPage() {
  const [data, setData] = useState<AvailableTestsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const totalPages = data?.totalPagesCount || 1;

  const loadTests = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAvailableTests({ page: currentPage, pageSize: PAGE_SIZE });
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити тести.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests(page);
  }, [page, loadTests]);

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  if (isLoading) {
    return <div className="p-6 max-w-4xl mx-auto">Завантаження тестів...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-4xl mx-auto text-red-600 font-bold">{error}</div>;
  }
  return (
    <div className="flex-1 pt-6 sm:p-8">
      <div className="sm:flex flex-row justify-between items-center mb-6">
            <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0'>Доступні тести
        <Breadcrumbs items={breadcrumbItems} />
            </h1>
            <Link
            href={'/dashboard/results'}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Мої результати
            </Link>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Немає доступних тестів.
        </div>
      ):(
     <div className="grid gap-6 md:grid-cols-2">
        {data.items.map((test,index) => (
        <RevealWrapper key={test.id} delay={index*40} duration={500} origin="top" distance="20px" reset={true}>
          <TestCard key={test.id} test={test} />
        </RevealWrapper>
        ))}
      </div>
      )}
      
  {/* Компонент пагінації */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">

            {totalPages <= 5 ? (
              // Якщо сторінок мало — показуємо всі
              Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                    i + 1 === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))
            ) : (
              <>
                {/* Перша сторінка */}
                <button
                  onClick={() => handlePageChange(1)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                    page === 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  1
                </button>

                {/* Якщо поточна сторінка > 3 — показуємо "..." */}
                {page > 3 && <span className="px-2">...</span>}

                {/* Поточна сторінка та сусідні */}
                {Array.from({ length: 3 }, (_, i) => {
                  const pageNumber = page - 1 + i;
                  if (pageNumber > 1 && pageNumber < totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                          pageNumber === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}

                {/* Якщо ще далеко до кінця — показуємо "..." */}
                {page < totalPages - 2 && <span className="px-2">...</span>}

                {/* Остання сторінка */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                    page === totalPages
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/*<span className="text-lg font-medium">Сторінка {page} з {totalPages}</span>*/}
            
          </div>
        )}
    </div>
  );
}