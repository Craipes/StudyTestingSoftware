
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {  AvailableTestsResponse } from '@/types';
import { fetchAvailableTests } from '@/lib/api';
import { TestCard } from '@/components/shared/TestCard';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';

const PAGE_SIZE = 10;

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
  
  if (!data || data.items.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 border-b pb-2">Доступні Тести</h1>
        <p className="text-center text-gray-500 mt-10">Наразі доступних тестів немає.</p>
      </div>
    );
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

     <div className="grid gap-6 md:grid-cols-2">
        {data.items.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
      
      {/* Компонент пагінації */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button 
            onClick={() => handlePageChange(page - 1)} 
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:text-gray-400"
          >
            ← Попередня
          </button>
          
          <span className="text-lg font-medium">Сторінка {page} з {totalPages}</span>
          
          <button 
            onClick={() => handlePageChange(page + 1)} 
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:text-gray-400"
          >
            Наступна →
          </button>
        </div>
      )}
    </div>
  );
}