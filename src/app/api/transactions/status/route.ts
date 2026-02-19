import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIP, checkRequestLimit, isRateLimited, recordFailedAttempt } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    const ip = getClientIP(request);

    // 1. General Rate Limit (Prevents DDoS/Bulk scraping)
    const generalLimit = checkRequestLimit(ip, 10, 1); // 10 requests per minute
    if (generalLimit.limited) {
        return NextResponse.json({
            error: `Too many requests. Retry after ${generalLimit.retryAfter}s`
        }, { status: 429 });
    }

    // 2. Failure Rate Limit (Prevents guessing receipt numbers)
    const failureLimit = isRateLimited(ip);
    if (failureLimit.limited) {
        return NextResponse.json({
            error: 'Account locked due to too many failed receipt lookups. Try again in 30 minutes.'
        }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const receipt = searchParams.get('receipt');

    if (!receipt) {
        return NextResponse.json({ error: 'Receipt number required' }, { status: 400 });
    }

    try {
        const transaction = await prisma.transaction.findFirst({
            where: { mpesaReceiptNumber: receipt }
        });

        if (!transaction) {
            recordFailedAttempt(ip);
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: transaction.payoutStatus,
            receipt: transaction.mpesaReceiptNumber,
            amount: transaction.payoutAmount,
            date: transaction.createdAt
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
