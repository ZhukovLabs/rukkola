import { LRUCache } from "lru-cache";

interface RateLimitEntry {
    attempts: number;
    firstAttempt: number;
    blockedUntil?: number;
}

const rateLimitCache = new LRUCache<string, RateLimitEntry>({
    max: 10000,
    ttl: 15 * 60 * 1000,
});

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; blockedUntil?: number } {
    const now = Date.now();
    const entry = rateLimitCache.get(ip);

    if (entry?.blockedUntil && entry.blockedUntil > now) {
        return {
            allowed: false,
            remainingAttempts: 0,
            blockedUntil: entry.blockedUntil,
        };
    }

    if (!entry || now - entry.firstAttempt > WINDOW_MS) {
        rateLimitCache.set(ip, { attempts: 1, firstAttempt: now });
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
        const blockedUntil = now + BLOCK_DURATION_MS;
        rateLimitCache.set(ip, { ...entry, blockedUntil });
        return {
            allowed: false,
            remainingAttempts: 0,
            blockedUntil,
        };
    }

    entry.attempts += 1;
    rateLimitCache.set(ip, entry);

    return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS - entry.attempts,
    };
}

export function resetRateLimit(ip: string): void {
    rateLimitCache.delete(ip);
}

export function getRemainingBlockTime(ip: string): number | null {
    const entry = rateLimitCache.get(ip);
    if (!entry?.blockedUntil) return null;
    
    const remaining = entry.blockedUntil - Date.now();
    return remaining > 0 ? remaining : null;
}