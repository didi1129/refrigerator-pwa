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

  // 1. 유통기한이 오늘부터 3일 이내인 모든 식재료 조회
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]

  const targetDate = new Date()
  targetDate.setDate(today.getDate() + 3)
  const dateString = targetDate.toISOString().split('T')[0]

  console.log(`Checking items between ${todayString} and ${dateString}`)

  const { data: items, error: fetchError } = await supabase
    .from('ingredients')
    .select('name, expiry_date')
    .gte('expiry_date', `${todayString}T00:00:00`)
    .lte('expiry_date', `${dateString}T23:59:59`)
    .order('expiry_date', { ascending: true })

  if (fetchError) {
    console.error('Error fetching ingredients:', fetchError)
    return new Response('Error fetching ingredients', { status: 500 })
  }

  if (!items || items.length === 0) {
    return new Response(`No items expiring between ${todayString} and ${dateString}`)
  }

  // 2. 모든 푸시 구독 정보 조회
  const { data: subs, error: subError } = await supabase
    .from('push_subscriptions')
    .select('subscription')

  if (subError) {
    console.error('Error fetching subscriptions:', subError)
    return new Response('Error fetching subscriptions', { status: 500 })
  }

  if (!subs || subs.length === 0) {
    return new Response('No subscriptions found')
  }

  // 3. 알림 내용 생성 (품목 리스트 요약)
  const payload = {
    title: '식재료 유통기한 확인! 🚨',
    body: items.length === 1
      ? `${items[0].name}의 유통기한이 임박했습니다.`
      : `${items[0].name} 외 ${items.length - 1}개의 재료가 곧 만료됩니다.`,
    url: '/'
  }

  // 4. 모든 구독자에게 알림 전송
  const sendPromises = subs.map(sub =>
    webpush.sendNotification(sub.subscription, JSON.stringify(payload))
      .catch(err => {
        console.error('Push error for sub:', err)
      })
  )

  await Promise.all(sendPromises)
  console.log(`Successfully sent notifications for ${items.length} items to ${subs.length} devices.`)

  return new Response('Notifications sent')
})
