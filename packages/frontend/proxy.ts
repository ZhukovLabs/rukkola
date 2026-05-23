import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;

  // Main page: remove no-store to allow bfcache
  if (pathname === '/') {
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'private, no-cache, max-age=0, must-revalidate'
    );
    return response;
  }

  const token = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;
  
  if (!token && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*", '/api/revalidate'],
};
