import { getToken } from './client';

export async function revalidateMenu() {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No auth token, skipping revalidate');
      return;
    }

    // Use absolute URL for revalidate API
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ path: '/' }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to revalidate menu:', error);
  }
}
