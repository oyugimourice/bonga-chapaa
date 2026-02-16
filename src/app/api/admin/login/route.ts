import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const validUser = process.env.ADMIN_USER || 'admin';
        const validPass = process.env.ADMIN_PASSWORD || 'admin';

        if (username === validUser && password === validPass) {
            // Create a simple session token
            // In production, use a more secure JWT library like 'jose' or 'iron-session'
            // For now, we'll use a simple token + secret comparison
            const sessionData = {
                user: username,
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            };

            const token = btoa(JSON.stringify(sessionData));

            // Set secure cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid username or password' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
