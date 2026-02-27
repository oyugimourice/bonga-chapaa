import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateMpesaIp } from '@/lib/mpesa-security';

export async function POST(request: NextRequest) {
    // 0. Security: Validate source IP
    if (!validateMpesaIp(request)) {
        console.warn("Unauthorized IP attempted to access B2C Timeout");
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        // Safaricom B2C Timeout Payload roughly looks like:
        // { Result: { ConversationID: '...', OriginatorConversationID: '...', ResultCode: ... } } 
        // OR sometimes top-level depending on version. 
        // We will try standard Result wrapper first.

        const result = body.Result || body;
        const conversationId = result.ConversationID;

        if (conversationId) {
            console.log(`Processing Timeout for ConversationID: ${conversationId}`);
            await prisma.transaction.updateMany({
                where: { b2cConversationId: conversationId },
                data: { payoutStatus: 'FAILED' }
            });
        } else {
            console.warn("B2C Timeout received without ConversationID", body);
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
    } catch (error) {
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Error" });
    }
}
