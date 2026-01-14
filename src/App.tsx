import { useEffect } from 'react';
import { Refrigerator, Bell } from 'lucide-react';
import { useIngredients } from './hooks/useIngredients';
import { AddIngredientForm } from './components/AddIngredientForm';
import { IngredientList } from './components/IngredientList';
import { NotificationBanner } from './components/NotificationBanner';
import { subscribeToPush } from './utils/push';

function App() {
  const { ingredients, loading, addIngredient, removeIngredient } = useIngredients();

  useEffect(() => {
    // 앱 진입 시 자동 알림 구독 시도
    const autoSubscribe = async () => {
      const result = await subscribeToPush();
      if (result?.success) {
        console.log('자동 푸시 알림 구독 성공');
      }
    };
    autoSubscribe();
  }, []);

  const handlePushSubscribe = async () => {
    const result = await subscribeToPush();
    if (result?.success) {
      alert('푸시 알림 구독에 성공했습니다! 이제 식재료 만료 알림을 받아보실 수 있습니다.');
    } else {
      if (result?.error === 'permission_denied') {
        alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해 주세요.');
      } else {
        alert('푸시 알림 구독에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleAdd = (name: string, entryDate: string, expiryDate: string) => {
    addIngredient({ name, entryDate, expiryDate });
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <NotificationBanner ingredients={ingredients} />

      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg">
            <Refrigerator size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">냉장고 재료를 부탁해</h1>
            <p className="text-sm font-bold text-slate-400">우리집 식재료 관리</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePushSubscribe}
            className="p-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm active:scale-95"
            title="알림 받기"
          >
            <Bell size={20} />
          </button>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-800">{ingredients.length}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Items</p>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        <AddIngredientForm onAdd={handleAdd} />

        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-slate-800">식재료 리스트</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              신선도순 정렬
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400">냉장고 확인 중...</p>
            </div>
          ) : (
            <IngredientList ingredients={ingredients} onRemove={removeIngredient} />
          )}
        </section>
      </main>

      <footer className="mt-20 text-center">
        <p className="text-xs font-bold text-slate-300 tracking-widest uppercase">
          &copy; 2026 Refrigerator PWA • Family Edition
        </p>
      </footer>
    </div>
  );
}

export default App;
