import { supabase } from './supabase';

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  // 알림 권한 요청
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('알림 권한이 거부되었습니다.');
    return;
  }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.error('VAPID Public Key가 없습니다.');
    return;
  }

  // 푸시 구독 생성
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey,
  });

  // Supabase에 구독 정보 저장
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert([
      {
        subscription,
        browser_info: navigator.userAgent
      }
    ]);

  if (error) {
    console.error('구독 정보 저장 실패:', error);
  } else {
    console.log('푸시 알림 구독 성공!');
  }
}
