'use client';

import { CustomizationItemType, MarketItem } from "@/app/dashboard/(common)/store/page";
import { useUser } from "@/app/dashboard/layout";
import api from "@/lib/axios";
import { Check, CheckCheck, Lock,ShoppingCart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Tilt from 'react-parallax-tilt';

const BACKEND_API=process.env.NEXT_PUBLIC_API_URL

interface MarketItemCardProps {
  item: MarketItem;
  onPurchase: (codeId: string) => void;
  onEquip: (codeId: string, type: CustomizationItemType) => void; 
}

export const MarketItemCard = ({ item, onPurchase, onEquip }: MarketItemCardProps) => {
  const [isBusy, setIsBusy] = useState(false);
  const { refetchUserInfo } = useUser();

  const handlePurchase = async () => {
    setIsBusy(true);
    try {
      await api.post(`/customization/purchase/${item.codeId}`);
      toast.success(`Предмет "${item.name}" успішно куплено!`);
      onPurchase(item.codeId); 
      refetchUserInfo();
    } catch (err:any) {
      if(err.response && err.response.status === 400) {
        toast.error(err.response.data.message || 'Недостатньо монет.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleEquip = async () => {
    setIsBusy(true);
    try {
      await api.post(`/customization/equip/${item.codeId}`);
      toast.success(`Предмет "${item.name}" обрано!`);
      onEquip(item.codeId, item.type);
      refetchUserInfo();
    } catch (err:any) {
      if(err.response.status === 400) {
        toast.error(err.response.data.message || 'Не вдалося обрати предмет.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const renderButton = () => {
    if (item.isEquipped===true) {
      return (
        <button
          disabled
          className="w-full mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white flex items-center justify-center gap-2"
        >
          <CheckCheck size={18} />
          Обрано
        </button>
      );
    }

    else if (item.isOwned) {
      return (
        <button
          onClick={handleEquip}
          disabled={isBusy}
          className="w-full mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {isBusy ? 'Обираємо...' : 'Обрати'}
        </button>
      );
    }

    if(item.levelRequired && item.unlockedByLevelUp) {
      return (
        <button
          disabled
          className="w-full mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-400 text-white flex items-center justify-center gap-2"
        >
          <Lock size={18} />
          Рівень {item.levelRequired}
        </button>
      );
    }

    return (
      <button
        onClick={handlePurchase}
        disabled={isBusy}
        className="w-full mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        {isBusy ? 'Купуємо...' : `Купити за ${item.price}`}
      </button>
    );
  };

  return (
    <Tilt 
    tiltReverse={true}
    transitionEasing="cubic-bezier(.03,.98,.52,.99)" 
    glareEnable={true} glareBorderRadius="3" glarePosition="all" className="transition">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
          <Image
            unoptimized={true}
            src={BACKEND_API + item.imageUrl} 
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{item.description}</p>
          {renderButton()}
        </div>
      </div>
    </Tilt>
  );
};