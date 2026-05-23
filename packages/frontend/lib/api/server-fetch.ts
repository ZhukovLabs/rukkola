const BASE_URL = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';

export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            next: {revalidate: 60},
            signal: AbortSignal.timeout(5000),
            ...options,
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}
