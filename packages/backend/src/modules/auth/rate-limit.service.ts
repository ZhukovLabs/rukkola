import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

@Injectable()
export class RateLimitService {
  private cache = new LRUCache<string, RateLimitEntry>({
    max: 10000,
    ttl: 15 * 60 * 1000,
  });

  private readonly MAX_ATTEMPTS = 10;
  private readonly WINDOW_MS = 15 * 60 * 1000;
  private readonly BLOCK_DURATION_MS = 30 * 60 * 1000;

  checkRateLimit(ip: string): {
    allowed: boolean;
    remainingAttempts: number;
    blockedUntil?: number;
  } {
    const now = Date.now();
    const entry = this.cache.get(ip);

    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: entry.blockedUntil,
      };
    }

    if (!entry || now - entry.firstAttempt > this.WINDOW_MS) {
      this.cache.set(ip, { attempts: 1, firstAttempt: now });
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 };
    }

    if (entry.attempts >= this.MAX_ATTEMPTS) {
      const blockedUntil = now + this.BLOCK_DURATION_MS;
      this.cache.set(ip, { ...entry, blockedUntil });
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
      };
    }

    entry.attempts += 1;
    this.cache.set(ip, entry);

    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - entry.attempts,
    };
  }

  resetRateLimit(ip: string): void {
    this.cache.delete(ip);
  }

  getRemainingBlockTime(ip: string): number | null {
    const entry = this.cache.get(ip);
    if (!entry?.blockedUntil) return null;

    const remaining = entry.blockedUntil - Date.now();
    return remaining > 0 ? remaining : null;
  }
}
