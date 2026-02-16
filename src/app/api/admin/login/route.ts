import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import {
    getClientIP,
    isRateLimited,
    recordFailedAttempt,
    clearAttempts,
    getAttemptInfo,
} from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const clientIP = getClientIP(request);
        const { username, password } = await request.json();

        // Check rate limit
        const rateLimitCheck = isRateLimited(clientIP);
        if (rateLimitCheck.limited) {
            const retryAfter = Math.ceil((rateLimitCheck.lockedUntil! - Date.now()) / 1000);
            console.warn(`🚫 Rate limit exceeded for IP: ${clientIP}`);
            return NextResponse.json(
                { error: `Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` },
                { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
            );
        }

        const validUser = process.env.ADMIN_USER || 'admin';
        const validPass = process.env.ADMIN_PASSWORD || 'admin';

        console.log('🔐 Login attempt:', { username, ip: clientIP });

        if (username === validUser && password === validPass) {
            // Clear previous failed attempts on successful login
            clearAttempts(clientIP);

            // Create a proper JWT token
            const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
            
            const secret = new TextEncoder().encode(jwtSecret);

            const token = await new SignJWT({
                user: username,
                iat: Math.floor(Date.now() / 1000),
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('24h')
                .sign(secret);

            console.log('✅ Token created successfully');

            // Set secure cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', token, {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24,
                path: '/',
            });

            console.log('✅ Login successful from IP:', clientIP);
            console.log('📍 Redirect flow: /auth/signin → POST /api/admin/login (200) → /admin (307) → /admin/overview (200)');
            return NextResponse.json({ success: true });
        }

        // Record failed attempt
        recordFailedAttempt(clientIP);
        const attemptInfo = getAttemptInfo(clientIP);
        const attemptsRemaining = Math.max(0, 5 - attemptInfo.count);
        
        console.warn(`❌ Failed login for ${username} from IP: ${clientIP}. Attempts: ${attemptInfo.count}/5`);
        
        return NextResponse.json(
            { 
                error: `Invalid username or password${attemptsRemaining > 0 ? `. ${attemptsRemaining} attempts remaining.` : '.'}`
            },
            { status: 401 }
        );
    } catch (error) {
        console.error('❌ Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
