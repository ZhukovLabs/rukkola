import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.INTERNAL_JWT_SECRET || '';

export async function POST(request: NextRequest) {
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'NOT SET');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  
  try {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    console.log('Token preview:', token.substring(0, 30) + '...');

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded:', decoded);
    } catch (e) {
      console.log('JWT verify error:', e instanceof Error ? e.message : e);
      return NextResponse.json(
        { success: false, error: 'Invalid token', details: e instanceof Error ? e.message : 'unknown' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { path } = body;

    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      revalidated: path,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
