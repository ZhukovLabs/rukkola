const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function revalidateMenu() {
  try {
    await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to revalidate menu:', error);
  }
}
