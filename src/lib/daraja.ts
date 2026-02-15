import axios from 'axios';

// Helper to get Daraja Access Token
export const getDarajaToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const url = environment === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error('Daraja Token Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch Daraja Token');
  }
};
    