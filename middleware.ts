import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers
    // Protect against Clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Protect against MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Control Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Enforce HSTS (Strict-Transport-Security) for 1 year
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Permissions Policy (Camera, Mic, Geolocation disabled by default)
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: '/:path*',
};
