
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateB2CPayout } from '@/lib/mpesa-tasks';

// This endpoint should be protected or called by a secure Cron job
// Vercel Cron: https://vercel.com/docs/cron-jobs
// Or manually via Admin dashboard

export async function GET(request: Request) {
    try {
        // 1. Find stuck transactions
        // Defined as PENDING for more than 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const pendingTransactions = await prisma.transaction.findMany({
            where: {
                payoutStatus: 'PENDING',
                createdAt: {
                    lt: fiveMinutesAgo
                }
            },
            take: 20 // Process in batches
        });

        if (pendingTransactions.length === 0) {
            return NextResponse.json({ message: "No pending transactions found." });
        }

        // 2. Process each transaction
        const results = await Promise.allSettled(
            pendingTransactions.map(async (tx: any) => {
                console.log(`Retrying payout for ${tx.mpesaReceiptNumber}`);
                // This will update status to PROCESSING or FAILED
                await initiateB2CPayout(tx.id);
                return tx.mpesaReceiptNumber;
            })
        );

        return NextResponse.json({
            message: `Processed ${pendingTransactions.length} transactions`,
            results
        });

    } catch (error) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
