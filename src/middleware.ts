
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect /admin routes with HTTP Basic Authentication
 * Credentials are set in .env: ADMIN_USER and ADMIN_PASSWORD
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only run on /admin routes
    if (pathname.startsWith('/admin')) {
        // Allow the login page itself
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        const session = request.cookies.get('admin_session');

        if (!session) {
            // No session, redirect to login
            const url = new URL('/admin/login', request.url);
            return NextResponse.redirect(url);
        }

        try {
            // Basic validation of the session token
            const sessionData = JSON.parse(atob(session.value));

            if (sessionData.expires < Date.now()) {
                // Expired
                const url = new URL('/admin/login', request.url);
                const response = NextResponse.redirect(url);
                response.cookies.delete('admin_session');
                return response;
            }

            return NextResponse.next();
        } catch (error) {
            // Invalid session
            const url = new URL('/admin/login', request.url);
            const response = NextResponse.redirect(url);
            response.cookies.delete('admin_session');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
