import React from 'react';
import { Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import type { Ingredient } from '../types/ingredient';
import { getExpiryStatus, getRemainingDays, formatDate } from '../utils/date';

interface Props {
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
}

export const IngredientList: React.FC<Props> = ({ ingredients, onRemove }) => {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <Clock size={48} className="opacity-20" />
        <p className="text-lg font-medium">냉장고가 비어있어요</p>
      </div>
    );
  }

  // Sort: Expired -> Urgent -> Safe
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const statusA = getExpiryStatus(a.expiryDate);
    const statusB = getExpiryStatus(b.expiryDate);
    const order = { expired: 0, urgent: 1, safe: 2 };
    return order[statusA] - order[statusB] || a.expiryDate.localeCompare(b.expiryDate);
  });

  return (
    <div className="grid grid-cols-1 gap-4">
      {sortedIngredients.map((item) => {
        const status = getExpiryStatus(item.expiryDate);
        const remaining = getRemainingDays(item.expiryDate);

        return (
          <div
            key={item.id}
            className="glass p-5 rounded-3xl flex items-center justify-between group transition-all hover:translate-x-1"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${status === 'expired'
                  ? 'bg-rose-100 text-rose-500'
                  : status === 'urgent'
                    ? 'bg-amber-100 text-amber-500'
                    : 'bg-emerald-100 text-emerald-500'
                  }`}
              >
                {status === 'expired' ? (
                  <AlertCircle size={28} />
                ) : status === 'urgent' ? (
                  <Clock size={28} />
                ) : (
                  <CheckCircle size={28} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                <div className="flex gap-3 text-xs font-semibold text-slate-400 mt-1">
                  <span>입고: {formatDate(item.entryDate)}</span>
                  <span>만료: {formatDate(item.expiryDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p
                  className={`text-sm font-black uppercase tracking-wider ${status === 'expired'
                    ? 'text-rose-500'
                    : status === 'urgent'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                    }`}
                >
                  {status === 'expired' ? (
                    '기간 만료'
                  ) : status === 'urgent' ? (
                    `${remaining}일 남음`
                  ) : (
                    `신선함 (+${remaining}일)`
                  )}
                </p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all transform active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
