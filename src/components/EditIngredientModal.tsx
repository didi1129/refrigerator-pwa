import React, { useState } from 'react';
import { X, Calendar, Tag, Loader2, Save } from 'lucide-react';
import { addDays, format } from 'date-fns';
import type { Ingredient } from '../types/ingredient';

interface Props {
  ingredient: Ingredient;
  onUpdate: (id: string, updates: Partial<Omit<Ingredient, 'id'>>) => Promise<void>;
  onClose: () => void;
  suggestions?: string[];
}

export const EditIngredientModal: React.FC<Props> = ({
  ingredient,
  onUpdate,
  onClose,
  suggestions = []
}) => {
  const [name, setName] = useState(ingredient.name);
  const [entryDate, setEntryDate] = useState(ingredient.entryDate.slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(ingredient.expiryDate.slice(0, 10));
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsUpdating(true);
    await onUpdate(ingredient.id, {
      name,
      entryDate,
      expiryDate
    });
    setIsUpdating(false);
    onClose();
  };

  const setRelativeExpiry = (days: number) => {
    const newExpiry = format(addDays(new Date(entryDate), days), 'yyyy-MM-dd');
    setExpiryDate(newExpiry);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center">
              <Save size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">식재료 정보 수정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
              <Tag size={12} /> 식재료 이름
            </label>
            <input
              type="text"
              list="edit-suggestions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="식재료 이름을 입력하세요"
              className="w-full px-5 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
              required
            />
            <datalist id="edit-suggestions">
              {suggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                <Calendar size={12} /> 입고일
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-5 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                <Calendar size={12} /> 마감일
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-5 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block mb-2 text-xs font-black text-slate-400 uppercase tracking-wider ml-1">기한 간편 설정</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 14, 30].map((days) => {
                const calculatedDate = format(addDays(new Date(entryDate), days), 'yyyy-MM-dd');
                const isActive = expiryDate === calculatedDate;

                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRelativeExpiry(days)}
                    className={`py-3 rounded-xl border transition-all font-bold text-sm ${isActive
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/30'
                      } active:scale-95`}
                  >
                    {days}일
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-[1.25rem] bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-[2] bg-emerald-500 text-white py-4 rounded-[1.25rem] font-bold text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  수정 중...
                </>
              ) : (
                '수정 완료'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
