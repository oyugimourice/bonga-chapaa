
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = body.Result;

        // Result parameters usually contain ConversationID, verify against DB
        const conversationId = result.ConversationID;
        const originConversationId = result.OriginatorConversationID;

        // Find transaction via conversation ID
        // Note: We need to store conversationId in initiateB2CPayout first
        const transaction = await prisma.transaction.findFirst({
            where: { b2cConversationId: conversationId }
        });

        if (!transaction) {
            console.error("Transaction not found for B2C Result:", conversationId);
            return NextResponse.json({ ResultCode: 0, ResultDesc: "Not Found" });
        }

        if (result.ResultCode === 0) {
            // Success
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    payoutStatus: 'COMPLETED',
                    // store full result if needed in rawCallbackData or separate field?
                    // For now, assume Completed is enough.
                    // Could update updated_at
                }
            });
        } else {
            // Failure
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    payoutStatus: 'FAILED',
                }
            });
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
        console.error("B2C Result Error:", error);
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Error" });
    }
}
