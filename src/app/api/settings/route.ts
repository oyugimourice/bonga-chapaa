import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { cookies } from 'next/headers';

/**
 * Verify admin session before allowing settings changes
 */
async function verifyAdminSession(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');
        return !!session;
    } catch {
        return false;
    }
}

export async function GET() {
    try {
        // Get or create settings (singleton pattern)
        let settings = await prisma.settings.findFirst();

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    userRate: new Decimal('0.20'),
                    safaricomRate: new Decimal('0.30'),
                    emailNotifications: true,
                    lowFloatWarning: true,
                    lowFloatThreshold: new Decimal('10000'),
                    notificationEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@bongachapaa.com',
                }
            });
        }

        return NextResponse.json({
            id: settings.id,
            userRate: settings.userRate.toString(),
            safaricomRate: settings.safaricomRate.toString(),
            emailNotifications: settings.emailNotifications,
            lowFloatWarning: settings.lowFloatWarning,
            lowFloatThreshold: settings.lowFloatThreshold.toString(),
            notificationEmail: settings.notificationEmail,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Verify admin session
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin session required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            userRate,
            safaricomRate,
            emailNotifications,
            lowFloatWarning,
            lowFloatThreshold,
            notificationEmail
        } = body;

        // Validate rates
        const userRateNum = parseFloat(userRate);
        const safaricomRateNum = parseFloat(safaricomRate);
        const thresholdNum = parseFloat(lowFloatThreshold);

        if (isNaN(userRateNum) || userRateNum < 0 || userRateNum > 1) {
            return NextResponse.json(
                { error: 'Invalid user rate. Must be between 0 and 1.' },
                { status: 400 }
            );
        }

        if (isNaN(safaricomRateNum) || safaricomRateNum < 0 || safaricomRateNum > 1) {
            return NextResponse.json(
                { error: 'Invalid Safaricom rate. Must be between 0 and 1.' },
                { status: 400 }
            );
        }

        if (safaricomRateNum < userRateNum) {
            return NextResponse.json(
                { error: 'Safaricom rate must be greater than or equal to user rate.' },
                { status: 400 }
            );
        }

        if (isNaN(thresholdNum) || thresholdNum < 0) {
            return NextResponse.json(
                { error: 'Invalid threshold. Must be a positive number.' },
                { status: 400 }
            );
        }

        // Get or create settings
        let settings = await prisma.settings.findFirst();

        const updateData = {
            userRate: new Decimal(userRateNum.toString()),
            safaricomRate: new Decimal(safaricomRateNum.toString()),
            emailNotifications: emailNotifications ?? true,
            lowFloatWarning: lowFloatWarning ?? true,
            lowFloatThreshold: new Decimal(thresholdNum.toString()),
            notificationEmail: notificationEmail || process.env.BREVO_SENDER_EMAIL,
        };

        if (!settings) {
            settings = await prisma.settings.create({
                data: updateData
            });
        } else {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: updateData
            });
        }

        console.log('✅ Settings updated:', {
            userRate: userRateNum,
            safaricomRate: safaricomRateNum,
            margin: (safaricomRateNum - userRateNum).toFixed(2)
        });

        return NextResponse.json({
            success: true,
            id: settings.id,
            userRate: settings.userRate.toString(),
            safaricomRate: settings.safaricomRate.toString(),
            emailNotifications: settings.emailNotifications,
            lowFloatWarning: settings.lowFloatWarning,
            lowFloatThreshold: settings.lowFloatThreshold.toString(),
            notificationEmail: settings.notificationEmail,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
