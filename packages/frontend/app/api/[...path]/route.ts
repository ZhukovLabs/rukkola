import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const url = `${API_BASE_URL}/${pathString}${request.nextUrl.search}`;

  const headers: Record<string, string> = {};
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const nextResponse = NextResponse.next();
    
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: nextResponse.headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка соединения с сервером' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const url = `${API_BASE_URL}/${pathString}`;
  const body = await request.json();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const nextResponse = NextResponse.next();
    
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: nextResponse.headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка соединения с сервером' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const url = `${API_BASE_URL}/${pathString}`;
  const body = await request.json();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const nextResponse = NextResponse.next();
    
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: nextResponse.headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка соединения с сервером' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const url = `${API_BASE_URL}/${pathString}${request.nextUrl.search}`;

  const headers: Record<string, string> = {};
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    const nextResponse = NextResponse.next();
    
    for (const cookie of response.headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: nextResponse.headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка соединения с сервером' },
      { status: 500 }
    );
  }
}
