import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateB2CPayout } from '@/lib/mpesa-tasks';
import { validateMpesaIp } from '@/lib/mpesa-security';

export async function POST(request: NextRequest) {
    // 0. Security: Validate source IP
    if (!validateMpesaIp(request)) {
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
        console.log("Incoming Request IP:", clientIp);
        console.warn("Unauthorized IP attempted to access C2B Confirmation");
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Idempotency Check
        const existing = await prisma.transaction.findUnique({
            where: { mpesaReceiptNumber: body.TransID }
        });

        if (existing) {
            return NextResponse.json({ ResultCode: 0, ResultDesc: "Duplicate" });
        }

        // 1. Logic: Calculate values based on BongaChapaa rates from DB
        const rawAmount = parseFloat(body.TransAmount);

        // Fetch dynamic rates from Settings (with fallback to env)
        const settings = await prisma.settings.findFirst();
        const SAFARICOM_RATE = parseFloat(settings?.safaricomRate?.toString() || process.env.SAFARICOM_PAYOUT_RATE || '0.30');
        const USER_RATE = parseFloat(settings?.userRate?.toString() || process.env.USER_PAYOUT_RATE || '0.20');

        // Calculate Points user "spent" (approx)
        const pointsConverted = rawAmount / SAFARICOM_RATE;

        // Calculate Payout
        const userPayout = pointsConverted * USER_RATE;

        // Commission = CashReceived - Payout
        const commission = rawAmount - userPayout;

        // 2. Database: Record the transaction
        const phoneNumber = body.BillRefNumber || body.MSISDN;
        const transaction = await prisma.transaction.create({
            data: {
                mpesaReceiptNumber: body.TransID,
                phoneNumber: phoneNumber,
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

        // 3. Trigger Payout 
        // We await this to ensure the request is finished before the serverless 
        // function returns, ensuring higher reliability.
        try {
            await initiateB2CPayout(transaction.id);
        } catch (e) {
            console.error("Async payout initiation failed:", e);
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
        console.error("C2B Confirmation Error:", error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" }, { status: 500 });
    }
}
