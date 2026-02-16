
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Middleware to protect /admin routes with JWT verification
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only run on /admin routes
    if (pathname.startsWith('/admin')) {
        const session = request.cookies.get('admin_session');

        if (!session) {
            // No session, redirect to the signin route
            const url = new URL('/auth/signin', request.url);
            return NextResponse.redirect(url);
        }

        try {
            // Verify JWT token
            const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
            const secret = new TextEncoder().encode(jwtSecret);

            await jwtVerify(session.value, secret);

            // Valid token, redirect base /admin to /admin/overview
            if (pathname === '/admin' || pathname === '/admin/') {
                return NextResponse.redirect(new URL('/admin/overview', request.url), { status: 303 });
            }

            return NextResponse.next();
        } catch (error) {
            // Invalid or expired token
            console.error('❌ Middleware: Token verification failed:', error instanceof Error ? error.message : error);
            const url = new URL('/auth/signin', request.url);
            const response = NextResponse.redirect(url);
            response.cookies.delete('admin_session');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/admin'],
};
