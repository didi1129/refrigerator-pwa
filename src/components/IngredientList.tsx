import React, { useState } from 'react';
import { Trash2, AlertCircle, Clock, CheckCircle, MoreVertical, Pencil } from 'lucide-react';
import type { Ingredient } from '../types/ingredient';
import { getExpiryStatus, getRemainingDays, formatDate, formatRelativeDate } from '../utils/date';
import { EditIngredientModal } from './EditIngredientModal';

interface Props {
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Ingredient, 'id'>>) => Promise<void>;
  suggestions?: string[];
}

export const IngredientList: React.FC<Props> = ({ ingredients, onRemove, onUpdate, suggestions }) => {
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
            className={`glass p-5 rounded-3xl flex items-center justify-between group transition-all hover:translate-x-1 relative ${activeMenu === item.id ? 'z-[30]' : 'z-0'}`}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={`size-8 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 ${status === 'expired'
                  ? 'bg-rose-100 text-rose-500'
                  : status === 'urgent'
                    ? 'bg-amber-100 text-amber-500'
                    : 'bg-emerald-100 text-emerald-500'
                  }`}
              >
                {status === 'expired' ? (
                  <AlertCircle size={18} />
                ) : status === 'urgent' ? (
                  <Clock size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-800 truncate">{item.name}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-400 mt-1">
                  <span className="whitespace-nowrap" title={formatDate(item.entryDate)}>입고: {formatRelativeDate(item.entryDate)}</span>
                  <span className="whitespace-nowrap" title={formatDate(item.expiryDate)}>만료: {formatRelativeDate(item.expiryDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
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
                  ) : <span className="text-emerald-500">{remaining}일 남음</span>
                  }
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all transform active:scale-95"
                >
                  <MoreVertical size={18} />
                </button>

                {activeMenu === item.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-slate-100 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors border-b border-slate-200"
                      >
                        <Pencil size={14} className="text-slate-400" />
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            onRemove(item.id);
                          }
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} />
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {editingItem && (
        <EditIngredientModal
          ingredient={editingItem}
          suggestions={suggestions}
          onUpdate={onUpdate}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};
