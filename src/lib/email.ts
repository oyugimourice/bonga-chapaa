import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY || ''
);

interface EmailParams {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
}

/**
 * Send a transactional email via Brevo
 */
export async function sendEmail({ to, subject, htmlContent, textContent }: EmailParams) {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'BongaChapaa',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@bongachapaa.com'
        };

        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;

        if (textContent) {
            sendSmtpEmail.textContent = textContent;
        }

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', response);
        return { success: true, messageId: (response as any).body?.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

/**
 * Send notification for failed transaction
 */
export async function sendFailedTransactionAlert(transaction: {
    id: string;
    phoneNumber: string;
    pointsPaid: number;
    payoutAmount: number;
    mpesaReceiptNumber: string;
    createdAt: Date;
}) {
    const settings = await getNotificationSettings();

    if (!settings.emailNotifications || !settings.notificationEmail) {
        console.log('Email notifications disabled or no email configured');
        return { success: false, reason: 'notifications_disabled' };
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .detail { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #dc2626; }
                .label { font-weight: bold; color: #6b7280; }
                .value { color: #111827; }
                .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
                .button { display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">⚠️ Transaction Failed</h2>
                </div>
                <div class="content">
                    <p>A payout transaction has failed and requires your attention.</p>
                    
                    <div class="detail">
                        <span class="label">Transaction ID:</span>
                        <span class="value">${transaction.id}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Customer Phone:</span>
                        <span class="value">${transaction.phoneNumber}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Bonga Points:</span>
                        <span class="value">${transaction.pointsPaid.toLocaleString()}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Payout Amount:</span>
                        <span class="value">KES ${transaction.payoutAmount.toLocaleString()}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">M-PESA Receipt:</span>
                        <span class="value">${transaction.mpesaReceiptNumber}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Time:</span>
                        <span class="value">${new Date(transaction.createdAt).toLocaleString()}</span>
                    </div>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="button">
                        View in Dashboard
                    </a>
                </div>
                <div class="footer">
                    <p>This is an automated notification from BongaChapaa. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textContent = `
Transaction Failed Alert

A payout transaction has failed and requires your attention.

Transaction ID: ${transaction.id}
Customer Phone: ${transaction.phoneNumber}
Bonga Points: ${transaction.pointsPaid}
Payout Amount: KES ${transaction.payoutAmount}
M-PESA Receipt: ${transaction.mpesaReceiptNumber}
Time: ${new Date(transaction.createdAt).toLocaleString()}

View in Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin
    `;

    return await sendEmail({
        to: settings.notificationEmail,
        subject: `⚠️ Transaction Failed - ${transaction.mpesaReceiptNumber}`,
        htmlContent,
        textContent
    });
}

/**
 * Send low float warning
 */
export async function sendLowFloatWarning(currentBalance: number, threshold: number) {
    const settings = await getNotificationSettings();

    if (!settings.lowFloatWarning || !settings.notificationEmail) {
        console.log('Low float warnings disabled or no email configured');
        return { success: false, reason: 'warnings_disabled' };
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .warning-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
                .balance { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
                .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
                .button { display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">⚠️ Low M-PESA Float Warning</h2>
                </div>
                <div class="content">
                    <div class="warning-box">
                        <p style="margin: 0;"><strong>Your M-PESA float balance is running low!</strong></p>
                    </div>
                    
                    <p>Current Balance:</p>
                    <div class="balance">KES ${currentBalance.toLocaleString()}</div>
                    
                    <p>This is below your configured threshold of <strong>KES ${threshold.toLocaleString()}</strong>.</p>
                    
                    <p><strong>Action Required:</strong></p>
                    <ul>
                        <li>Top up your M-PESA float to continue processing payouts</li>
                        <li>Review pending transactions in the dashboard</li>
                        <li>Contact your M-PESA account manager if needed</li>
                    </ul>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="button">
                        View Dashboard
                    </a>
                </div>
                <div class="footer">
                    <p>This is an automated notification from BongaChapaa. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textContent = `
Low M-PESA Float Warning

Your M-PESA float balance is running low!

Current Balance: KES ${currentBalance.toLocaleString()}
Threshold: KES ${threshold.toLocaleString()}

Action Required:
- Top up your M-PESA float to continue processing payouts
- Review pending transactions in the dashboard
- Contact your M-PESA account manager if needed

View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin
    `;

    return await sendEmail({
        to: settings.notificationEmail,
        subject: `⚠️ Low M-PESA Float Alert - KES ${currentBalance.toLocaleString()}`,
        htmlContent,
        textContent
    });
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(to: string) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .success-box { background: #d1fae5; border: 2px solid #16a34a; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center; }
                .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">✅ Email Configuration Test</h2>
                </div>
                <div class="content">
                    <div class="success-box">
                        <h3 style="margin: 0; color: #16a34a;">Success!</h3>
                        <p style="margin: 10px 0 0 0;">Your email notifications are configured correctly.</p>
                    </div>
                    
                    <p>This is a test email from your BongaChapaa admin panel.</p>
                    
                    <p>You will receive notifications for:</p>
                    <ul>
                        <li>Failed transaction payouts</li>
                        <li>Low M-PESA float warnings</li>
                        <li>System alerts</li>
                    </ul>
                    
                    <p>If you received this email, your notification system is working perfectly!</p>
                </div>
                <div class="footer">
                    <p>Sent from BongaChapaa Admin Panel at ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textContent = `
Email Configuration Test

Success! Your email notifications are configured correctly.

This is a test email from your BongaChapaa admin panel.

You will receive notifications for:
- Failed transaction payouts
- Low M-PESA float warnings
- System alerts

If you received this email, your notification system is working perfectly!

Sent from BongaChapaa Admin Panel at ${new Date().toLocaleString()}
    `;

    return await sendEmail({
        to,
        subject: '✅ BongaChapaa Email Test',
        htmlContent,
        textContent
    });
}

// Helper function to get notification settings
async function getNotificationSettings() {
    const { prisma } = await import('@/lib/prisma');
    let settings = await prisma.settings.findFirst();

    if (!settings) {
        settings = await prisma.settings.create({
            data: {}
        });
    }

    return settings;
}
