import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateB2CPayout } from '@/lib/mpesa-tasks'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Logic: Calculate values based on BongaChapaa rates
    const rawAmount = parseFloat(body.TransAmount); // KES value Safaricom sends (0.3 per point)
    const pointsConverted = rawAmount / 0.3;
    const userPayout = pointsConverted * 0.2; // Your rate (e.g., 20 cents per point)
    const commission = rawAmount - userPayout;

    // 2. Database: Record the transaction
    const transaction = await prisma.transaction.create({
      data: {
        mpesaReceiptNumber: body.TransID,
        phoneNumber: body.BillRefNumber, // The user's phone they entered as Account No.
        pointsPaid: pointsConverted,
        equivalentCash: rawAmount,
        payoutAmount: userPayout,
        serviceFee: commission,
        payoutStatus: 'PENDING',
        rawCallbackData: body,
      },
    });

    // 3. Background Task: Trigger the B2C Payout
    // In a real app, use a queue or a separate function call
    await initiateB2CPayout(transaction.id);

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("C2B Hook Error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" }, { status: 500 });
  }
}