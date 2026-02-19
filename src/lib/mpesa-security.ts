
import { NextRequest, NextResponse } from 'next/server';

/**
 * Official Safaricom Daraja IP ranges.
 * These are used to validate that incoming webhooks are actually from Safaricom.
 */
const SAFARICOM_IPS = [
    '196.201.214.200',
    '196.201.214.206',
    '196.201.213.114',
    '196.201.214.207',
    '196.201.214.208',
    '196.201.213.44',
    '196.201.212.127',
    '196.201.212.138',
    '196.201.212.129',
    '196.201.212.136'
];

/**
 * Validates if a request is coming from a Safaricom IP address.
 * Use this in M-PESA callback routes.
 */
export function validateMpesaIp(request: NextRequest) {
    const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

    // In development or sandbox local testing, we might want to skip this
    // unless we are using a proxy like ngrok which provides the real IP.
    if (environment === 'sandbox' && process.env.NODE_ENV === 'development') {
        return true;
    }

    // Get the IP from common headers (Vercel uses x-forwarded-for)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    // Safely get the client IP, falling back to request.ip (which may require type casting)
    const clientIp = forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : (realIp || (request as any).ip);

    if (!clientIp) return false;

    return SAFARICOM_IPS.includes(clientIp);
}

/**
 * Validates the Cron job authorization header or secret.
 */
export function validateCronSecret(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
        console.warn('CRON_SECRET is not set in environment variables.');
        return false;
    }

    // Check if it's a Bearer token or a simple secret match
    if (authHeader === `Bearer ${expectedSecret}`) return true;
    if (authHeader === expectedSecret) return true;

    return false;
}
