'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios'; 
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import { RevealWrapper } from 'next-reveal';
import { MarketItemCard } from '@/components/shared/MarketItemCard';

const BACKEND_API=process.env.NEXT_PUBLIC_API_URL


export enum CustomizationItemType {
  Avatar = 1,
  AvatarFrame = 2,
  Background = 3,
}

export interface MarketItem {
  codeId: string;
  name: string;
  description: string;
  type: CustomizationItemType;
  imageUrl: string;
  unlockedByDefault: boolean;
  unlockedByLevelUp: boolean;
  price: number;
  levelRequired: number;
  isOwned: boolean;
  isEquipped?: boolean;
}


const MarketPage = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Крамниця' }
  ];

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customization/market'); 
        const processedItems = response.data.map((item: MarketItem) => ({
          ...item,
        }));
        
        setItems(processedItems);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити предмети з магазину.');
        toast.error('Не вдалося завантажити предмети.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarket();
  }, []);

  const handlePurchaseSuccess = (codeId: string) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.codeId === codeId ? { ...item, isOwned: true } : item
      )
    );
  };

  const handleEquipSuccess = (codeId: string, type: CustomizationItemType) => {
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.type === type) {
          return { ...item, isEquipped: item.codeId === codeId };
        }
        return item;
      })
    );
  };

  const avatars = useMemo(
    () => items.filter(item => item.type === CustomizationItemType.Avatar),
    [items]
  );
  const frames = useMemo(
    () => items.filter(item => item.type === CustomizationItemType.AvatarFrame),
    [items]
  );
  const backgrounds = useMemo(
    () => items.filter(item => item.type === CustomizationItemType.Background),
    [items]
  );

  if (loading) {
    return <div className="p-8 text-center">Завантаження магазину...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 pt-6 sm:p-8">
       <div className="sm:flex flex-row justify-between items-center mb-6">
            <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0'>Крамниця
              <Breadcrumbs items={breadcrumbItems} />
            </h1>
            <Link
              href={'/dashboard/tests'}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Отримати монети
            </Link>
          </div>

      <Tabs defaultValue="avatars" className="w-full">
        <TabsList>
          <TabsTrigger className='px-6 py-2 text-base' value="avatars">Аватари</TabsTrigger>
          <TabsTrigger className='px-6 py-2 text-base' value="frames">Рамки</TabsTrigger>
          <TabsTrigger className='px-6 py-2 text-base' value="backgrounds">Фони</TabsTrigger>
        </TabsList>
        <TabsContent value="avatars">
          {/* Секція Аватарів */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 dark:border-gray-700 dark:text-gray-100">Аватари</h2>
        {avatars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {avatars.map((item, index) => (
              <RevealWrapper key={item.codeId} delay={index * 50} origin='top' reset={true}>
              <MarketItemCard 
                key={item.codeId} 
                item={item}
                onPurchase={handlePurchaseSuccess}
                onEquip={handleEquipSuccess}
              />
              </RevealWrapper>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Немає доступних аватарів.</p>
        )}
      </section>
        </TabsContent>
        <TabsContent value="frames">
          {/* Секція Рамок */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 dark:border-gray-700 dark:text-gray-100">Рамки для аватара</h2>
        {frames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {frames.map((item, index) => (
              <RevealWrapper key={item.codeId} delay={index * 50} origin='top' reset={true}>
                <MarketItemCard
                  key={item.codeId}
                  item={item}
                  onPurchase={handlePurchaseSuccess}
                  onEquip={handleEquipSuccess}
                />
              </RevealWrapper>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Немає доступних рамок.</p>
        )}
      </section>
        </TabsContent>
        <TabsContent value="backgrounds">
                {/* Секція Фонів */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 dark:border-gray-700 dark:text-gray-100">Фони профілю</h2>
        {backgrounds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {backgrounds.map((item, index) => (
              <RevealWrapper key={item.codeId} delay={index * 50} origin='top' reset={true}>
                <MarketItemCard
                  key={item.codeId}
                  item={item}
                  onPurchase={handlePurchaseSuccess}
                  onEquip={handleEquipSuccess}
                />
              </RevealWrapper>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Немає доступних фонів.</p>
        )}
      </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketPage;