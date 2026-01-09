import React from 'react';
import { Bell } from 'lucide-react';
import type { Ingredient } from '../types/ingredient';
import { getExpiryStatus, getRemainingDays } from '../utils/date';

interface Props {
  ingredients: Ingredient[];
}

export const NotificationBanner: React.FC<Props> = ({ ingredients }) => {
  const urgentItems = ingredients.filter((i) => getExpiryStatus(i.expiryDate) === 'urgent');

  if (urgentItems.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-lg">
      <div className="glass-dark p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 animate-pulse">
          <Bell size={20} />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold leading-tight">
            {urgentItems.length === 1
              ? `${urgentItems[0].name}의 마감 기한이 ${getRemainingDays(urgentItems[0].expiryDate)}일 남았어요!`
              : `${urgentItems[0].name} 외 ${urgentItems.length - 1}개의 기한이 임박했어요!`}
          </p>
          <p className="text-rose-300 text-[10px] font-bold mt-0.5">냉장고를 확인해 주세요</p>
        </div>
      </div>
    </div>
  );
};
