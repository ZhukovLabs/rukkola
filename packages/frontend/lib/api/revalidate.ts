import { API_BASE_URL } from './client';

export async function revalidateMenu() {
  try {
    await fetch(`${API_BASE_URL}/../revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/' }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to revalidate menu:', error);
  }
}
