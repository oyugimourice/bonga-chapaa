import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email address is required' },
                { status: 400 }
            );
        }

        const result = await sendTestEmail(email);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Test email sent successfully',
                messageId: result.messageId
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send test email', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
