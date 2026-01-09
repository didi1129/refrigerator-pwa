import React, { useState } from 'react';
import { Plus, Calendar, Tag } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface Props {
  onAdd: (name: string, entryDate: string, expiryDate: string) => void;
}

export const AddIngredientForm: React.FC<Props> = ({ onAdd }) => {
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
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center text-white">
          <Plus size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">새 식재료 추가</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
            <Tag size={14} /> 식재료 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 사과, 우유, 계란"
            className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all font-medium"
            required
          />
        </div>

        <div className="space-y-1">
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

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-500">기한 (입고일로부터 며칠 뒤?)</label>
          <div className="flex gap-2">
            {[3, 7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setExpiryDays(days.toString())}
                className={`flex-1 py-2 rounded-xl border transition-all font-semibold ${expiryDays === days.toString()
                    ? 'bg-mint-500 border-mint-500 text-white shadow-lg'
                    : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white'
                  }`}
              >
                {days}일
              </button>
            ))}
            <input
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-20 px-4 py-2 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mint-500 text-center font-bold"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all transform active:scale-95 shadow-xl mt-4"
      >
        냉장고에 넣기
      </button>
    </form>
  );
};
