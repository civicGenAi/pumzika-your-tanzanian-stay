import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SNIPPE_API_KEY = Deno.env.get('SNIPPE_API_KEY')
const SNIPPE_BASE_URL = 'https://api.snippe.sh/v1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, details } = await req.json()

        if (!SNIPPE_API_KEY) {
            throw new Error('Snippe API key is missing on server')
        }

        const response = await fetch(`${SNIPPE_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SNIPPE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_type: type,
                ...details
            }),
        })

        const result = await response.json()

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
