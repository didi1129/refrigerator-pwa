import { useState, useEffect } from 'react';
import { Refrigerator, Bell, Share, PlusSquare, Plus } from 'lucide-react';
import { useIngredients } from './hooks/useIngredients';
import { AddIngredientForm } from './components/AddIngredientForm';
import { IngredientList } from './components/IngredientList';
import { NotificationBanner } from './components/NotificationBanner';
import { subscribeToPush } from './utils/push';
import { CATEGORIES, type IngredientCategory } from './types/ingredient';

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

function App() {
  const { ingredients, suggestions, loading, adding, addIngredient, updateIngredient, removeIngredient } = useIngredients();
  const [showPwaInstallPrompt, setShowPwaInstallPrompt] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory>('전체');
  const [isNotificationPermissionNeeded, setIsNotificationPermissionNeeded] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'default';
    }
    return false;
  });

  useEffect(() => {
    // PWA 독립 실행 모드인지 확인
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as NavigatorStandalone).standalone
        || document.referrer.includes('android-app://');

      // 모바일 기기에서 독립 실행 모드가 아닌 경우 설치 유도 팝업 노출
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
      if (isMobile && !isStandaloneMode && !isDismissed) {
        setShowPwaInstallPrompt(true);
      }
    };

    checkStandalone();

    // 앱 진입 시 자동 알림 구독 시도
    const autoSubscribe = async () => {
      // 독립 실행 모드에서만 자동 구독 시도 (특히 iOS 배려)
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as NavigatorStandalone).standalone) {
        const result = await subscribeToPush();
        if (result?.success) {
          console.log('자동 푸시 알림 구독 성공');
          setIsNotificationPermissionNeeded(false);
        }
      }
    };
    autoSubscribe();
  }, []);

  const handlePushSubscribe = async () => {
    const result = await subscribeToPush();
    if (result?.success) {
      alert('푸시 알림 구독에 성공했습니다! 정상 작동 확인을 위해 테스트 알림을 보냈습니다. 곧 도착할 거예요! 🔔');
      setIsNotificationPermissionNeeded(false);
    } else {
      if (result?.error === 'already_subscribed') {
        alert('이미 알림 구독 중입니다. 식재료 만료 전(3일 전)에 알림을 보내드릴게요! 🔔');
        setIsNotificationPermissionNeeded(false);
      } else if (result?.error === 'push_not_supported') {
        alert('이 브라우저는 푸시 알림을 지원하지 않거나, 홈 화면에 추가된 후에만 가능합니다. "홈 화면에 추가"를 먼저 해주세요.');
      } else if (result?.error === 'permission_denied') {
        alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해 주세요.');
      } else {
        alert('푸시 알림 구독에 실패했습니다. 홈 화면에서 앱을 실행 중인지 확인해 주세요.');
      }
    }
  };

  const handleAdd = async (name: string, entryDate: string, expiryDate: string, category?: IngredientCategory) => {
    await addIngredient({ name, entryDate, expiryDate, category });
  };

  const filteredIngredients = selectedCategory === '전체'
    ? ingredients
    : ingredients.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen px-6 py-12 pb-32 max-w-2xl mx-auto bg-slate-50/50">
      {showPwaInstallPrompt && (
        <div className="fixed bottom-6 left-6 right-6 z-50 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Refrigerator size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">앱으로 설치해서 사용해보세요!</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                바탕화면에 설치하면 푸시 알림을 받을 수 있고, 더 빠르게 접근할 수 있어요.
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">설치 방법</p>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                    <Share size={14} className="text-slate-400" />
                  </div>
                  <span>1. 브라우저의 <strong>공유</strong> 버튼을 눌러주세요.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                    <PlusSquare size={14} className="text-slate-400" />
                  </div>
                  <span>2. <strong>홈 화면에 추가</strong>를 선택해주세요.</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowPwaInstallPrompt(false);
                  localStorage.setItem('pwa-prompt-dismissed', 'true');
                }}
                className="mt-6 w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      <NotificationBanner ingredients={ingredients} />

      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg">
              <Refrigerator size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">우리집 냉장고를 부탁해</h1>
              <p className="text-sm font-bold text-slate-400">우리집 식재료 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              {isNotificationPermissionNeeded && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-slate-900 text-white text-[11px] font-bold py-2 px-3 rounded-xl shadow-xl whitespace-nowrap border border-slate-700">
                    <div className="tooltip-arrow" />
                    식재료 알림을 켜보세요! 🔔
                  </div>
                </div>
              )}
              <button
                onClick={handlePushSubscribe}
                className={`p-3 rounded-2xl transition-all shadow-sm active:scale-95 relative ${isNotificationPermissionNeeded
                  ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-xl scale-110'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                title="알림 받기"
              >
                {isNotificationPermissionNeeded && (
                  <span className="absolute inset-0 rounded-2xl bg-emerald-500 animate-pulse-ring" />
                )}
                <Bell size={20} className={isNotificationPermissionNeeded ? 'animate-pulse-dot' : ''} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${selectedCategory === cat
                ? 'bg-slate-800 text-white shadow-lg'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{selectedCategory}</h2>
              <span className="text-sm font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">
                {filteredIngredients.length}
              </span>
            </div>
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
            <IngredientList
              ingredients={filteredIngredients}
              onRemove={removeIngredient}
              onUpdate={updateIngredient}
              suggestions={suggestions}
            />
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 z-40 group shadow-emerald-200"
        aria-label="식재료 추가"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Add Ingredient Modal */}
      {isAddModalOpen && (
        <AddIngredientForm
          onAdd={handleAdd}
          onClose={() => setIsAddModalOpen(false)}
          isAdding={adding}
          suggestions={suggestions}
        />
      )}

      <footer className="mt-20 text-center">
        <p className="text-xs font-bold text-slate-300 tracking-widest uppercase">
          &copy; 2026 우리집 냉장고를 부탁해
        </p>
      </footer>
    </div>
  );
}

export default App;

