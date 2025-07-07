import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateEmail } from '@/lib/auth-utils';
import { generateVerificationCode, sendVerificationEmail, storeVerificationCode } from '@/lib/email-utils';

interface SendVerificationRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendVerificationRequest = await request.json();
    const { email, firstName, lastName } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, first name, and last name are required' },
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

    // Check if user already exists
    const existingUserResult = await db.execute({
      sql: 'SELECT user_id FROM users WHERE email = ?',
      args: [email.toLowerCase()]
    });

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create a temporary user record (will be updated after verification)
    const result = await db.execute({
      sql: `INSERT INTO users (first_name, last_name, email, password_hash, email_verified, updated_at) 
            VALUES (?, ?, ?, '', 0, CURRENT_DATE) 
            RETURNING user_id`,
      args: [firstName.trim(), lastName.trim(), email.toLowerCase()]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const userId = result.rows[0].user_id as number;

    // Store verification code
    storeVerificationCode(email.toLowerCase(), verificationCode, userId);

    // Send verification email
    await sendVerificationEmail(email, verificationCode, firstName);

    return NextResponse.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending the verification email' },
      { status: 500 }
    );
  }
} 