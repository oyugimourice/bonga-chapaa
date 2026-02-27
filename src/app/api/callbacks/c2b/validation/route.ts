import { NextRequest, NextResponse } from 'next/server';
import { validateMpesaIp } from '@/lib/mpesa-security';

export async function POST(request: NextRequest) {
    // 0. Security: Validate source IP
    if (!validateMpesaIp(request)) {
        console.warn("Unauthorized IP attempted to access C2B Validation");
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log("C2B Validation:", body);

        // Accept all transactions
        // Basic Validation: Ensure Account Number (BillRefNumber) is a valid phone
        // user enters their phone number as account number when paying via Paybill
        const billRefNumber = body.BillRefNumber;

        // Regex for Kenyan phone numbers (start with 254, 07, 01, etc)
        // Simple check: 10-13 digits
        const phoneRegex = /^(?:254|\+254|0)?(7|1)(?:[0-9]){8}$/;

        if (!billRefNumber || !phoneRegex.test(billRefNumber)) {
            console.log("Rejected Invalid Phone:", billRefNumber);
            return NextResponse.json({
                ResultCode: 1,
                ResultDesc: "Rejected: Invalid Account Number. Please use your Phone Number."
            });
        }

        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });
    } catch (error) {
        console.error("C2B Validation Error:", error);
        // Even on error, accept to avoid customer refund loops unless critical
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }
}
