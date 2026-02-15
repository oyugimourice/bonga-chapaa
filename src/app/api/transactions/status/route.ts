
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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
