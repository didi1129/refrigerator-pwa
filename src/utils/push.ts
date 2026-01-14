import { supabase } from './supabase';

export async function subscribeToPush() {
  try {
    if (!('serviceWorker' in navigator)) {
      console.error('이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return { success: false, error: 'sw_not_supported' };
    }

    if (!('PushManager' in window)) {
      console.error('이 브라우저는 푸시 알림을 지원하지 않습니다.');
      return { success: false, error: 'push_not_supported' };
    }

    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      console.error('VAPID Public Key가 .env 파일에 설정되어 있지 않습니다.');
      return { success: false, error: 'no_public_key' };
    }

    console.log('서비스 워커 준비 대기 중...');
    const registration = await navigator.serviceWorker.ready;
    console.log('서비스 워커 준비 완료:', registration);

    // 알림 권한 상태 확인
    console.log('현재 알림 권한 상태:', Notification.permission);

    if (Notification.permission === 'denied') {
      console.warn('알림 권한이 이미 거부되어 있습니다.');
      return { success: false, error: 'already_denied' };
    }

    if (Notification.permission === 'granted') {
      console.log('알림 권한이 이미 승인되어 있습니다. 구독을 진행합니다.');
    } else {
      console.log('알림 권한 요청 중...');
    }

    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    console.log('권한 요청 결과:', permission);
    if (permission !== 'granted') {
      console.warn('알림 권한이 거부되었습니다.');
      return { success: false, error: 'permission_denied' };
    }

    // 푸시 구독 생성
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    // Supabase에 구독 정보 저장
    const subJson = JSON.parse(JSON.stringify(subscription));
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert([
        {
          subscription: subJson,
          browser_info: navigator.userAgent
        }
      ]);

    if (error) {
      console.error('구독 정보 저장 실패:', error);
      return { success: false, error: 'db_error' };
    } else {
      console.log('푸시 알림 구독 성공!');
      return { success: true };
    }
  } catch (error) {
    console.error('푸시 구독 중 오류 발생:', error);
    return { success: false, error: 'unknown_error' };
  }
}
