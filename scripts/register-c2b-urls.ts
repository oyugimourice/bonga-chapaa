import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.C2B_SHORTCODE;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const baseUrl = MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

async function getAccessToken() {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
}

async function registerUrls() {
    try {
        console.log('--- M-PESA C2B URL Registration ---');
        console.log(`Environment: ${MPESA_ENVIRONMENT}`);
        console.log(`Shortcode: ${SHORTCODE}`);
        console.log(`App URL: ${APP_URL}`);

        if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !APP_URL) {
            throw new Error('Missing required environment variables. Check your .env file.');
        }

        const token = await getAccessToken();
        const url = `${baseUrl}/mpesa/c2b/v1/registerurl`;

        const response = await axios.post(url, {
            ShortCode: SHORTCODE,
            ResponseType: "Completed", // or "Cancelled"
            ConfirmationURL: `${APP_URL}/api/mpesa/c2b/confirmation`,
            ValidationURL: `${APP_URL}/api/mpesa/c2b/validation`
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Registration Response:', response.data);
        console.log('--- Success! ---');
    } catch (error: any) {
        console.error('Registration Error:', error.response?.data || error.message);
    }
}

registerUrls();
