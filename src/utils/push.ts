import { supabase } from './supabase';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function checkSubscription() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('구독 확인 중 오류:', error);
    return false;
  }
}

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

    const publicKeyString = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicKeyString) {
      console.error('VAPID Public Key가 .env 파일에 설정되어 있지 않습니다.');
      return { success: false, error: 'no_public_key' };
    }

    // VAPID 키를 Uint8Array로 변환 (안드로이드/크롬 호환성 향상)
    const publicKey = urlBase64ToUint8Array(publicKeyString);

    console.log('서비스 워커 준비 대기 중...');
    const registration = await navigator.serviceWorker.ready;
    console.log('서비스 워커 준비 완료:', registration);

    // 이미 구독 중인지 확인
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('이미 푸시 알림에 구독되어 있습니다.');
      return { success: false, error: 'already_subscribed' };
    }

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
      console.log('푸시 알림 구독 성공! 웰컴 알림을 요청합니다.');

      // 즉시 환영 알림 발송 요청 (Edge Function 호출)
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            name: '내 냉장고를 부탁해',
            welcome: true
          }
        });
      } catch (invokeError) {
        console.warn('웰컴 알림 발송 실패 (구독은 성공):', invokeError);
      }

      return { success: true };
    }
  } catch (error) {
    console.error('푸시 구독 중 오류 발생:', error);
    return { success: false, error: 'unknown_error' };
  }
}
