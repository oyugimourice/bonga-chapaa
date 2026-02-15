
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateB2CPayout } from '@/lib/mpesa-tasks';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Idempotency Check
        const existing = await prisma.transaction.findUnique({
            where: { mpesaReceiptNumber: body.TransID }
        });

        if (existing) {
            return NextResponse.json({ ResultCode: 0, ResultDesc: "Duplicate" });
        }

        // 1. Logic: Calculate values based on BongaChapaa rates
        const rawAmount = parseFloat(body.TransAmount); // KES value Safaricom sends
        // Safaricom Rate (approx 0.3 or merchant rate, configurable)
        // Actually, if we assume 1 point = 0.3 KES, then Points = KES / 0.3
        // But let's assume rawAmount IS the cash value we received.
        // The margin is determined by how much we pay out vs what we got.
        // If we pay 0.2 per point and get 0.3 per point equivalent.

        // Default Safaricom Rate (What 1 point is worth in KES to merchant)
        const SAFARICOM_RATE = parseFloat(process.env.SAFARICOM_PAYOUT_RATE || '0.30');
        // User Payout Rate (What we pay user per point)
        const USER_RATE = parseFloat(process.env.USER_PAYOUT_RATE || '0.20');

        // Calculate Points user "spent" (approx)
        // Points = CashReceived / SafaricomRate
        const pointsConverted = rawAmount / SAFARICOM_RATE;

        // Calculate Payout
        // Payout = Points * UserRate
        const userPayout = pointsConverted * USER_RATE;

        // Commission = CashReceived - Payout
        const commission = rawAmount - userPayout;

        // 2. Database: Record the transaction
        const phoneNumber = body.BillRefNumber || body.MSISDN;
        const transaction = await prisma.transaction.create({
            data: {
                mpesaReceiptNumber: body.TransID,
                phoneNumber: phoneNumber, // Specific phone for this tx
                pointsPaid: pointsConverted,
                equivalentCash: rawAmount,
                payoutAmount: userPayout,
                serviceFee: commission,
                payoutStatus: 'PENDING',
                rawCallbackData: body,
                // Link to user (find or create)
                user: {
                    connectOrCreate: {
                        where: { phoneNumber: phoneNumber },
                        create: {
                            phoneNumber: phoneNumber,
                            name: `Customer ${phoneNumber.slice(-4)}`
                        }
                    }
                }
            },
        });

        // 3. Trigger Payout (Async - don't block response too long ideally, but ensure it starts)
        // Using waitUntil would be better on Vercel, but for now standard await
        // to ensure we at least fire the request.
        try {
            await initiateB2CPayout(transaction.id);
        } catch (e) {
            console.error("Failed to initiate payout immediately:", e);
            // Transaction remains PENDING, cron job should pick it up later
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
        console.error("C2B Confirmation Error:", error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" }, { status: 500 });
    }
}
