import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SNIPPE_WEBHOOK_SECRET = Deno.env.get('SNIPPE_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    const signature = req.headers.get('X-Webhook-Signature')
    const timestamp = req.headers.get('X-Webhook-Timestamp')
    const eventType = req.headers.get('X-Webhook-Event')

    if (!signature || !timestamp || !SNIPPE_WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Missing security headers' }), { status: 400 })
    }

    const rawBody = await req.text()

    // 1. Verify Webhook Signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(SNIPPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const message = `${timestamp}.${rawBody}`
    const signatureBytes = new Uint8Array(
        signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    )

    const expectedSignatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
    )

    const expectedSignature = Array.from(new Uint8Array(expectedSignatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    if (expectedSignature !== signature) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 })
    }

    // 2. Process Event
    if (eventType === 'payment.completed') {
        const payload = JSON.parse(rawBody)
        const bookingId = payload.metadata?.booking_id

        if (bookingId) {
            const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

            const { error } = await supabase
                .from('bookings')
                .update({
                    status: 'confirmed',
                    payment_status: 'completed',
                    payment_id: payload.id
                })
                .eq('id', bookingId)

            if (error) {
                console.error('Database update error:', error)
                return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 })
            }
        }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
})
