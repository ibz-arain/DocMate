import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, getTokenFromRequest, sanitizeUser, validateName } from '@/lib/auth-utils';
import { User, UpdateUserRequest } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const result = await db.execute({
      sql: `SELECT user_id, first_name, last_name, email, phone_number, 
                   is_active, plan_type, plan_limits,
                   created_at, updated_at 
            FROM users WHERE user_id = ? AND is_active = 1`,
      args: [payload.userId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0] as unknown as User;
    const publicUser = sanitizeUser(user);

    return NextResponse.json(publicUser);

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching user information' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body: UpdateUserRequest = await request.json();
    const { first_name, last_name, phone_number } = body;

    // Validate the updates
    const updates: any = {};
    const args: any[] = [];
    let sql = 'UPDATE users SET updated_at = CURRENT_DATE';

    if (first_name !== undefined) {
      const firstNameValidation = validateName(first_name);
      if (!firstNameValidation.isValid) {
        return NextResponse.json(
          { message: `First name: ${firstNameValidation.message}` },
          { status: 400 }
        );
      }
      sql += ', first_name = ?';
      args.push(first_name.trim());
    }

    if (last_name !== undefined) {
      const lastNameValidation = validateName(last_name);
      if (!lastNameValidation.isValid) {
        return NextResponse.json(
          { message: `Last name: ${lastNameValidation.message}` },
          { status: 400 }
        );
      }
      sql += ', last_name = ?';
      args.push(last_name.trim());
    }

    if (phone_number !== undefined) {
      sql += ', phone_number = ?';
      args.push(phone_number || null);
    }

    sql += ' WHERE user_id = ? RETURNING user_id, first_name, last_name, email, phone_number, is_active, plan_type, plan_limits, created_at, updated_at';
    args.push(payload.userId);

    // Update user
    const result = await db.execute({
      sql,
      args
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0] as unknown as User;
    const publicUser = sanitizeUser(user);

    return NextResponse.json(publicUser);

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating user information' },
      { status: 500 }
    );
  }
} 