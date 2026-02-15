import axios from 'axios';
import { prisma } from './prisma';
import { getDarajaToken } from './daraja';
import { sendFailedTransactionAlert } from './email';

export async function initiateB2CPayout(transactionId: string) {
  const trx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!trx) return;

  try {
    const token = await getDarajaToken();
    const baseUrl = process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    // Correct endpoint for B2C
    const b2cUrl = `${baseUrl}/mpesa/b2c/v1/paymentrequest`;

    const response = await axios.post(b2cUrl, {
      InitiatorName: process.env.B2C_INITIATOR_NAME,
      SecurityCredential: process.env.B2C_SECURITY_CREDENTIAL,
      CommandID: "BusinessPayment",
      Amount: Math.floor(Number(trx.payoutAmount)), // M-PESA doesn't like cents in B2C usually
      PartyA: process.env.B2C_SHORTCODE,
      PartyB: trx.phoneNumber,
      Remarks: "BongaChapaa Payout",
      QueueTimeOutURL: process.env.B2C_TIMEOUT_URL,
      ResultURL: process.env.B2C_RESULT_URL,
      Occasion: "BongaConversion"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Update status to processing
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        payoutStatus: 'PROCESSING',
        b2cConversationId: response.data.ConversationID
      }
    });

  } catch (error: any) {
    console.error("B2C Error:", error.response?.data || error.message);
    const updatedTx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { payoutStatus: 'FAILED' }
    });

    try {
      await sendFailedTransactionAlert({
        id: updatedTx.id,
        phoneNumber: updatedTx.phoneNumber,
        pointsPaid: Number(updatedTx.pointsPaid),
        payoutAmount: Number(updatedTx.payoutAmount),
        mpesaReceiptNumber: updatedTx.mpesaReceiptNumber,
        createdAt: updatedTx.createdAt
      });
    } catch (emailError) {
      console.error("Failed to send error email:", emailError);
    }
  }
}