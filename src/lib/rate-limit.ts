/**
 * Simple in-memory rate limiter for login attempts
 * Tracks failed attempts by IP address
 */

interface AttemptRecord {
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
}

// In-memory store: IP -> attempt record
const attemptMap = new Map<string, AttemptRecord>();

// Configuration
const MAX_ATTEMPTS = 5; // Max failed attempts
const WINDOW_MINUTES = 15; // Time window in minutes
const LOCKOUT_MINUTES = 30; // Lockout duration in minutes

const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000;

export class RateLimitError extends Error {
    constructor(
        public retryAfter: number,
        public lockedUntil: number
    ) {
        super(`Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`);
        this.name = 'RateLimitError';
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Check if IP is rate limited
 */
export function isRateLimited(ip: string): { limited: boolean; lockedUntil?: number } {
    const record = attemptMap.get(ip);
    
    if (!record) {
        return { limited: false };
    }

    const now = Date.now();

    // Check if lockout period has expired
    if (record.lockedUntil && now >= record.lockedUntil) {
        attemptMap.delete(ip);
        return { limited: false };
    }

    // If locked, return lockout info
    if (record.lockedUntil) {
        return { limited: true, lockedUntil: record.lockedUntil };
    }

    // Check if window has expired
    if (now - record.lastAttempt > WINDOW_MS) {
        attemptMap.delete(ip);
        return { limited: false };
    }

    // Check if max attempts exceeded
    if (record.count >= MAX_ATTEMPTS) {
        const lockedUntil = now + LOCKOUT_MS;
        record.lockedUntil = lockedUntil;
        attemptMap.set(ip, record);
        return { limited: true, lockedUntil };
    }

    return { limited: false };
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const record = attemptMap.get(ip);

    if (!record) {
        attemptMap.set(ip, { count: 1, lastAttempt: now });
        return;
    }

    // Reset count if window expired
    if (now - record.lastAttempt > WINDOW_MS) {
        attemptMap.set(ip, { count: 1, lastAttempt: now });
        return;
    }

    // Increment count
    record.count += 1;
    record.lastAttempt = now;
    attemptMap.set(ip, record);
}

/**
 * Clear failed attempts for an IP (call after successful login)
 */
export function clearAttempts(ip: string): void {
    attemptMap.delete(ip);
}

/**
 * Get attempt info for diagnostics
 */
export function getAttemptInfo(ip: string) {
    return attemptMap.get(ip) || { count: 0 };
}

/**
 * Clear all rate limit records (use cautiously)
 */
export function clearAllAttempts(): void {
    attemptMap.clear();
}
