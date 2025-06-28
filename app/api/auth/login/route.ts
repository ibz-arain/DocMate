import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  verifyPassword, 
  createJWT, 
  sanitizeUser, 
  validateEmail 
} from '@/lib/auth-utils';
import { LoginRequest, User } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Find user by email
    const result = await db.execute({
      sql: `SELECT user_id, first_name, last_name, email, password_hash, phone_number, 
                   email_verified, phone_verified, is_active, created_at, updated_at 
            FROM users WHERE email = ?`,
      args: [email.toLowerCase()]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0] as unknown as User;

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { message: 'Your account has been deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password_hash) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await db.execute({
      sql: 'UPDATE users SET updated_at = CURRENT_DATE WHERE user_id = ?',
      args: [user.user_id]
    });

    // Create sanitized user object
    const publicUser = sanitizeUser(user);

    // Create JWT token
    const token = await createJWT({ 
      userId: user.user_id, 
      email: user.email 
    });

    // Create response
    const response = NextResponse.json({
      user: publicUser,
      message: 'Login successful'
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred while logging in' },
      { status: 500 }
    );
  }
} 