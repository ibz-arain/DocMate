import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  hashPassword, 
  createJWT, 
  sanitizeUser, 
  validateEmail, 
  validatePassword, 
  validateName 
} from '@/lib/auth-utils';
import { RegisterRequest, User } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { first_name, last_name, email, password, phone_number } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { message: 'First name, last name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate first name
    const firstNameValidation = validateName(first_name);
    if (!firstNameValidation.isValid) {
      return NextResponse.json(
        { message: `First name: ${firstNameValidation.message}` },
        { status: 400 }
      );
    }

    // Validate last name
    const lastNameValidation = validateName(last_name);
    if (!lastNameValidation.isValid) {
      return NextResponse.json(
        { message: `Last name: ${lastNameValidation.message}` },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
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

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const result = await db.execute({
      sql: `INSERT INTO users (first_name, last_name, email, password_hash, phone_number, updated_at) 
            VALUES (?, ?, ?, ?, ?, CURRENT_DATE) 
            RETURNING user_id, first_name, last_name, email, phone_number, email_verified, phone_verified, is_active, created_at, updated_at`,
      args: [first_name.trim(), last_name.trim(), email.toLowerCase(), password_hash, phone_number || null]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const newUser = result.rows[0] as unknown as User;
    const publicUser = sanitizeUser(newUser);

    // Create JWT token
    const token = await createJWT({ 
      userId: newUser.user_id, 
      email: newUser.email 
    });

    // Create response
    const response = NextResponse.json({
      user: publicUser,
      message: 'Account created successfully'
    }, { status: 201 });

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating your account' },
      { status: 500 }
    );
  }
} 