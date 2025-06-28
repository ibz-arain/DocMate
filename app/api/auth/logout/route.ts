import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Clear the auth token cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred while logging out' },
      { status: 500 }
    );
  }
} 