import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/users/register',
  '/api/auth/logout'
];

// Routes that require authentication
const protectedRoutes = [
  '/api/users/me',
  '/api/users/update',
  '/api/users/delete',
  '/playground',
  '/playground/process',
  '/playground/history',
  '/playground/api',
  '/playground/templates'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the route requires authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // For API routes, return JSON response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For other routes (like playground), redirect to login page
      // Include the current path as a redirect parameter
      const url = new URL('/account', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify the token
      await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );

      return NextResponse.next();
    } catch (error) {
      // For API routes, return JSON response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      // For other routes, redirect to login page
      // Include the current path as a redirect parameter
      const url = new URL('/account', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/playground',
    '/playground/:path*'
  ],
}; 