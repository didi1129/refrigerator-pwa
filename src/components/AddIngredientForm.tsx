import React, { useState } from 'react';
import { Plus, Calendar, Tag, Loader2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface Props {
  onAdd: (name: string, entryDate: string, expiryDate: string) => void;
  isAdding?: boolean;
  suggestions?: string[];
}

export const AddIngredientForm: React.FC<Props> = ({ onAdd, isAdding, suggestions = [] }) => {
  const [name, setName] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDays, setExpiryDays] = useState('7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const expiryDate = format(addDays(new Date(entryDate), parseInt(expiryDays)), 'yyyy-MM-dd');
    onAdd(name, entryDate, expiryDate);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-3xl shadow-xl space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center text-white">
          <Plus size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">새 식재료 추가</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
            <Tag size={14} /> 식재료 이름
          </label>
          <input
            type="text"
            list="ingredient-suggestions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 사과, 우유, 계란"
            className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all font-medium"
            required
          />
          <datalist id="ingredient-suggestions">
            {suggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
            <Calendar size={14} /> 입고일
          </label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all font-medium"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-500 mb-2 block">마감 기한</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[3, 7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setExpiryDays(days.toString())}
                className={`py-3 rounded-xl border transition-all font-semibold text-sm ${expiryDays === days.toString()
                  ? 'bg-mint-500 border-mint-500 text-white shadow-lg'
                  : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white'
                  }`}
              >
                {days}일
              </button>
            ))}
            <div className="col-span-1">
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="w-full h-full px-2 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mint-500 text-center font-bold text-sm"
                placeholder="직접"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isAdding}
        className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all transform active:scale-95 shadow-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
      >
        {isAdding ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            냉장고에 넣는 중...
          </>
        ) : (
          '냉장고에 넣기'
        )}
      </button>
    </form>
  );
};
