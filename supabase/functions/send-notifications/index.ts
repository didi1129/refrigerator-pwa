// Supabase Edge Function: send-notifications
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Deno 환경에서 npm 패키지를 안정적으로 사용하기 위해 npm: 지시자 사용
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('Missing VAPID keys')
    }

    webpush.setVapidDetails(
      'mailto:admin@refrigerator-pwa.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )

    let itemsToNotify = []
    let isImmediate = false

    if (req.method === 'POST') {
      const body = await req.json().catch(() => null)
      if (body && body.name) {
        itemsToNotify = [body]
        isImmediate = true
      }
    }

    if (!isImmediate) {
      const now = new Date()
      const kstOffset = 9 * 60 * 60 * 1000
      const kstNow = new Date(now.getTime() + kstOffset)
      const todayString = kstNow.toISOString().split('T')[0]
      const kstTarget = new Date(kstNow.getTime() + (3 * 24 * 60 * 60 * 1000))
      const dateString = kstTarget.toISOString().split('T')[0]

      const { data: items, error: fetchError } = await supabase
        .from('ingredients')
        .select('name, expiry_date')
        .gte('expiry_date', todayString)
        .lte('expiry_date', dateString)

      if (fetchError) throw fetchError
      itemsToNotify = items || []
    }

    if (itemsToNotify.length === 0) {
      return new Response(JSON.stringify({ message: 'No items' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: subs, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')

    if (subError) throw subError

    const payload = {
      title: isImmediate ? '새 재료 알림! 🥬' : '식재료 유통기한 확인! 🚨',
      body: itemsToNotify.length === 1
        ? `${itemsToNotify[0].name}의 유통기한이 임박했습니다.`
        : `${itemsToNotify[0].name} 외 ${itemsToNotify.length - 1}개의 재료가 곧 만료됩니다.`,
      url: '/'
    }

    const sendPromises = (subs || []).map(sub =>
      webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(() => null)
    )
    await Promise.all(sendPromises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
