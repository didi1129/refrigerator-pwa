import React, { useState } from 'react';
import { Plus, Calendar, Tag, Loader2, X } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface Props {
  onAdd: (name: string, entryDate: string, expiryDate: string) => Promise<void>;
  onClose: () => void;
  isAdding?: boolean;
  suggestions?: string[];
}

export const AddIngredientForm: React.FC<Props> = ({ onAdd, onClose, isAdding, suggestions = [] }) => {
  const [name, setName] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await onAdd(name, entryDate, expiryDate);
    setName('');
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
              <Plus size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">새 식재료 추가</h2>
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
              list="ingredient-suggestions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 사과, 우유, 계란"
              className="w-full px-5 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
              required
              autoFocus
            />
            <datalist id="ingredient-suggestions">
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
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">기한 간편 설정</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRelativeExpiry(days)}
                  className="py-3 rounded-xl border border-slate-100 bg-white text-slate-500 font-bold text-sm hover:border-emerald-200 hover:bg-emerald-50/30 transition-all active:scale-95"
                >
                  {days}일
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-[1.25rem] bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="flex-[2] bg-emerald-500 text-white py-4 rounded-[1.25rem] font-bold text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
            >
              {isAdding ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  추가 중...
                </>
              ) : (
                '냉장고에 넣기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
