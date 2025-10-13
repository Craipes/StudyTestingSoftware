
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {  CompletedTestSessionsResponse } from '@/types';
import { fetchCompletedTestSessions } from '@/lib/api';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';
import { TestResultCard } from '@/components/shared/TestResultCard';

const PAGE_SIZE = 8;

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Результати тестів'}
  ];


export default function StudentTestsPage() {
  const [data, setData] = useState<CompletedTestSessionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const totalPages = data?.totalPagesCount || 1;

  const loadTests = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCompletedTestSessions({ page: currentPage, pageSize: PAGE_SIZE });
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити результати.');
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
    return <div className="p-6 max-w-4xl mx-auto">Завантаження результатів...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-4xl mx-auto text-red-600 font-bold">{error}</div>;
  }

  return (
    <div className="flex-1 pt-6 sm:p-8">
      <div className="sm:flex flex-row justify-between items-center mb-6">
            <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0'>Результати Тестів
        <Breadcrumbs items={breadcrumbItems} />
            </h1>
            <Link
            href={'/dashboard/tests'}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Доступні тести
            </Link>
      </div>

        {!data || data.items.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            Немає завершених тестів для відображення.
          </div>
        ):(
              <div className="grid gap-6 md:grid-cols-2">
                {data.items.map((test) => (
                  <TestResultCard key={test.id} sessionResult={test} />
                ))}
              </div>
        )}
      
      {/* Компонент пагінації */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button 
            onClick={() => handlePageChange(page - 1)} 
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600  text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center cursor-pointer justify-center disabled:bg-gray-400"
          >
            ←
          </button>
          
          <span className="text-lg font-medium">Сторінка {page} з {totalPages}</span>
          
          <button 
            onClick={() => handlePageChange(page + 1)} 
            disabled={page === totalPages}
            className=" px-4 py-2 bg-blue-600  text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center cursor-pointer justify-center disabled:bg-gray-400"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}