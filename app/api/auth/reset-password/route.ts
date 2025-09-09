import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateEmail, validatePassword, hashPassword } from '@/lib/auth-utils';
import { verifyAndRemovePasswordResetCode } from '@/lib/email-utils';

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { email, code, newPassword } = body;

    // Validate required fields
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: 'Email, verification code, and new password are required' },
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

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      );
    }

    // Verify the reset code
    const codeVerification = verifyAndRemovePasswordResetCode(email.toLowerCase(), code);
    if (!codeVerification.isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUserResult = await db.execute({
      sql: 'SELECT user_id FROM users WHERE email = ? AND is_active = 1',
      args: [email.toLowerCase()]
    });

    if (existingUserResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = existingUserResult.rows[0] as any;

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    await db.execute({
      sql: 'UPDATE users SET password_hash = ?, updated_at = CURRENT_DATE WHERE user_id = ?',
      args: [hashedPassword, user.user_id]
    });

    return NextResponse.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
