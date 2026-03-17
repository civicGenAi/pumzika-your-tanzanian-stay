import { supabase } from './supabase';

const SNIPPE_API_KEY = import.meta.env.VITE_SNIPPE_API_KEY;
const SNIPPE_BASE_URL = 'https://api.snippe.sh/v1';

export type PaymentType = 'mobile' | 'card';

export interface SnippePaymentDetails {
    amount: number; // In TZS
    phone_number: string;
    customer: {
        firstname: string;
        lastname: string;
        email: string;
        address?: string;
        city?: string;
    };
    metadata?: Record<string, any>;
}

/**
 * Calculates the total amount inclusive of Snippe's transaction fees
 * Mobile: 0.5%
 * Card: 3.0%
 */
export const calculateTotalWithFees = (baseAmount: number, type: PaymentType): number => {
    const fee = type === 'mobile' ? 0.005 : 0.03;
    return Math.ceil(baseAmount / (1 - fee));
};

export const createSnippePayment = async (type: PaymentType, details: SnippePaymentDetails) => {
    const finalAmount = calculateTotalWithFees(details.amount, type);

    const payload: any = {
        details: {
            amount: finalAmount,
            currency: 'TZS',
        },
        phone_number: details.phone_number.replace(/\+/g, ''),
        customer: details.customer,
        webhook_url: `https://rzkjrvyorxdkkijbubiq.supabase.co/functions/v1/snippe-webhook`,
        metadata: details.metadata,
    };

    if (type === 'card') {
        payload.details.redirect_url = `${window.location.origin}/booking-confirmation`;
        payload.details.cancel_url = `${window.location.origin}/checkout`;
        payload.customer.address = details.customer.address || 'Dar es Salaam';
        payload.customer.city = details.customer.city || 'Dar es Salaam';
        payload.customer.state = 'DSM';
        payload.customer.postcode = '00000';
        payload.customer.country = 'TZ';
    }

    try {
        // Call our OWN Supabase Edge Function proxy to avoid CORS and protect the API Key
        const { data, error } = await supabase.functions.invoke('payment-proxy', {
            body: { type, details: payload }
        });

        if (error) throw error;

        if (data.status === 'error') {
            throw new Error(data.message || 'Payment initiation failed');
        }

        return data.data;
    } catch (error: any) {
        console.error('Snippe Proxy Error:', error);
        throw error;
    }
};

export const getPaymentStatus = async (reference: string) => {
    if (!SNIPPE_API_KEY) throw new Error('Snippe API key is missing');

    try {
        const response = await fetch(`${SNIPPE_BASE_URL}/payments/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SNIPPE_API_KEY}`,
            },
        });

        const result = await response.json();
        return result.data; // Includes status: 'pending', 'success', 'failed'
    } catch (error) {
        console.error('Status fetch error:', error);
        throw error;
    }
};
