import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateEmail } from '@/lib/auth-utils';
import { generateVerificationCode, sendPasswordResetEmail, storePasswordResetCode } from '@/lib/email-utils';

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
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

    // Check if user exists
    const existingUserResult = await db.execute({
      sql: 'SELECT user_id, first_name, last_name FROM users WHERE email = ? AND is_active = 1',
      args: [email.toLowerCase()]
    });

    if (existingUserResult.rows.length === 0) {
      // Don't reveal if email exists or not for security reasons
      return NextResponse.json({
        message: 'If an account with this email exists, you will receive a password reset code.',
        code: '000000' // Fake code for demo purposes
      });
    }

    const user = existingUserResult.rows[0] as any;

    // Generate verification code
    const resetCode = generateVerificationCode();

    // Send password reset email
    await sendPasswordResetEmail(email, resetCode, user.first_name);

    // Store the reset code (after successful email send)
    storePasswordResetCode(email.toLowerCase(), resetCode, {
      firstName: user.first_name,
      lastName: user.last_name
    });

    return NextResponse.json({
      message: 'Password reset code sent successfully',
      code: resetCode // For demo purposes, return the code
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
