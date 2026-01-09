// Supabase Edge Function: send-notifications
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
  const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')

  webpush.setVapidDetails(
    'mailto:example@yourdomain.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )

  // 1. 유통기한이 3일 남은 식재료 조회 (UTC 기준 오늘+3일)
  const threeDaysLater = new Date()
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)
  const dateString = threeDaysLater.toISOString().split('T')[0]

  const { data: items } = await supabase
    .from('ingredients')
    .select('name')
    .filter('expiry_date', 'gte', `${dateString}T00:00:00`)
    .filter('expiry_date', 'lte', `${dateString}T23:59:59`)

  if (!items || items.length === 0) return new Response('No items to notify')

  // 2. 모든 푸시 구독 정보 조회
  const { data: subs } = await supabase.from('push_subscriptions').select('subscription')
  if (!subs) return new Response('No subscriptions')

  // 3. 알림 전송
  const notifications = items.map(item => ({
    title: '유통기한 임박 알림! 🚨',
    body: `${item.name}의 유통기한이 3일 남았습니다.`,
    url: '/'
  }))

  const sendPromises = subs.flatMap(sub =>
    notifications.map(notif =>
      webpush.sendNotification(sub.subscription, JSON.stringify(notif))
        .catch(err => console.error('Push error:', err))
    )
  )

  await Promise.all(sendPromises)

  return new Response('Notifications sent')
})
