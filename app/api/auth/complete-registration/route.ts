import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createJWT, sanitizeUser, validatePassword } from '@/lib/auth-utils';
import { User } from '@/types/auth';

interface CompleteRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteRegistrationRequest = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user exists and is verified
    const userResult = await db.execute({
      sql: `SELECT user_id, first_name, last_name, email, phone_number, email_verified, phone_verified, is_active, created_at, updated_at 
            FROM users WHERE email = ? AND email_verified = 1`,
      args: [email.toLowerCase()]
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found or email not verified' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0] as unknown as User;

    // Hash password
    const password_hash = await hashPassword(password);

    // Update user with password
    const updateResult = await db.execute({
      sql: `UPDATE users 
            SET password_hash = ?, updated_at = CURRENT_DATE 
            WHERE user_id = ? 
            RETURNING user_id, first_name, last_name, email, phone_number, email_verified, phone_verified, is_active, created_at, updated_at`,
      args: [password_hash, user.user_id]
    });

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Failed to update user account' },
        { status: 500 }
      );
    }

    const updatedUser = updateResult.rows[0] as unknown as User;
    const publicUser = sanitizeUser(updatedUser);

    // Create JWT token
    const token = await createJWT({ 
      userId: updatedUser.user_id, 
      email: updatedUser.email 
    });

    // Create response
    const response = NextResponse.json({
      user: publicUser,
      message: 'Registration completed successfully'
    }, { status: 200 });

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
    console.error('Complete registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred while completing registration' },
      { status: 500 }
    );
  }
} 