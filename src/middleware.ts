
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect /admin routes with HTTP Basic Authentication
 * Credentials are set in .env: ADMIN_USER and ADMIN_PASSWORD
 */
export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const authHeader = request.headers.get('authorization');

        if (authHeader) {
            try {
                // Extract credentials from "Basic <base64>" header
                const authValue = authHeader.split(' ')[1];
                const [user, pwd] = atob(authValue).split(':');

                const validUser = process.env.ADMIN_USER || 'admin';
                const validPass = process.env.ADMIN_PASSWORD || 'admin';

                if (user === validUser && pwd === validPass) {
                    return NextResponse.next();
                }
            } catch (error) {
                // Invalid base64 or malformed header
                console.error('Auth header parsing error:', error);
            }
        }

        // Authentication failed or missing - prompt for credentials
        return new NextResponse('Authentication Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="BongaChapaa Admin Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
