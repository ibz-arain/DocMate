import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAndRemoveCode } from '@/lib/email-utils';

interface VerifyEmailRequest {
  email: string;
  code: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json();
    const { email, code } = body;

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    const verification = verifyAndRemoveCode(email.toLowerCase(), code);
    
    if (!verification.isValid || !verification.userId) {
      return NextResponse.json(
        { message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    const result = await db.execute({
      sql: `UPDATE users 
            SET email_verified = 1, updated_at = CURRENT_DATE 
            WHERE user_id = ? AND email = ? 
            RETURNING user_id, first_name, last_name, email, phone_number, email_verified, phone_verified, is_active, created_at, updated_at`,
      args: [verification.userId, email.toLowerCase()]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { message: 'An error occurred while verifying the email' },
      { status: 500 }
    );
  }
} 