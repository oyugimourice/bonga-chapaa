import axios from 'axios';
import { prisma } from './prisma';

// Helper to get Daraja Access Token with Caching
export const getDarajaToken = async () => {
  // 1. Check if we have a valid cached token
  const cachedToken = await prisma.tokenStore.findUnique({
    where: { id: 'daraja_token' }
  });

  // If token exists and is still valid (with 2 min buffer)
  if (cachedToken && cachedToken.expiresAt.getTime() > Date.now() + 2 * 60 * 1000) {
    return cachedToken.accessToken;
  }

  // 2. No valid cache, fetch new token
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

    const newToken = response.data.access_token;
    const expiresInSeconds = parseInt(response.data.expires_in);

    // 3. Update Cache
    await prisma.tokenStore.upsert({
      where: { id: 'daraja_token' },
      update: {
        accessToken: newToken,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000)
      },
      create: {
        id: 'daraja_token',
        accessToken: newToken,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000)
      }
    });

    return newToken;
  } catch (error: any) {
    console.error('Daraja Token Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch Daraja Token');
  }
};