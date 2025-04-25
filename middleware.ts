import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/auth/login',
  '/api/users/register',
  '/api/auth/logout',
  '/api/auth/providers',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/error',
  '/api/auth/callback',
  '/account',
  '/use-cases',
  '/docs',
  '/changelog',
  '/about',
  '/demo'
];

// Routes that require authentication
const protectedRoutes = [
  '/api/users/me',
  '/api/users/update',
  '/api/users/delete',
  '/playground',
  // '/playground/process',
  // '/playground/history',
  // '/playground/api',
  // '/playground/templates'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early exit for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for NextAuth session token for all other routes (implicitly protected)
  const token = await getToken({ req: request, secret: JWT_SECRET });
  console.log(`Middleware check for ${pathname}: Token found?`, !!token);

  // If no token, redirect or return error
    if (!token) {
    // Check if it's an API route request
      if (pathname.startsWith('/api/')) {
      // Do not protect next-auth internal API routes even if not explicitly public
      if (pathname.startsWith('/api/auth/')) {
         return NextResponse.next();
      }
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
    // For page routes, redirect to the sign-in page
      const url = new URL('/account', request.url);
    url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

  // Token exists, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth/|_next/static|_next/image|favicon.ico|logo.png|manifest.json).*)',
    '/playground/:path*'
  ],
}; 