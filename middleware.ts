import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/account',
  '/use-cases',
  '/docs',
  '/docs/introduction',
  '/docs/quick-start',
  '/docs/api',
  '/docs/examples',
  '/docs/templates',
  '/docs/demo',
  '/changelog',
  '/about',
  '/demo'
];

// Routes that require authentication
const protectedRoutes = [
  '/api/auth/me',
  '/api/users',
  '/api/documents',
  '/api/templates',
  '/api/endpoints',
  '/api/endpoints_usage',
  '/api/analyze',
  '/playground'
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true;
    // Handle dynamic routes like /docs/[...slug]
    if (route.endsWith('/') && pathname.startsWith(route)) return true;
    if (pathname.startsWith('/docs/') && route === '/docs') return true;
    return false;
  });
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  return token || null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      // Redirect to login for protected pages
      if (pathname.startsWith('/playground')) {
        const loginUrl = new URL('/account', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Verify token
    const payload = await verifyJWT(token!);
    if (!payload) {
      // Clear invalid token
      const response = pathname.startsWith('/playground') 
        ? NextResponse.redirect(new URL('/account', request.url))
        : NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
      
      response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId.toString());
      requestHeaders.set('x-user-email', payload.email);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 