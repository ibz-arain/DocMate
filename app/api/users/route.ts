import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, getTokenFromRequest, sanitizeUser } from '@/lib/auth-utils';
import { User } from '@/types/auth';

// GET /api/users - Get all users (for admin purposes - requires authentication)
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

    // Get all users (without password hashes)
    const result = await db.execute(`
      SELECT user_id, first_name, last_name, email, phone_number, 
             is_active, plan_type, plan_limits,
             created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    const users = result.rows.map(row => row as unknown as User).map(sanitizeUser);
    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete current user account
export async function DELETE(request: NextRequest) {
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

    // Instead of hard delete, we'll deactivate the user
    const result = await db.execute({
      sql: 'UPDATE users SET is_active = 0, updated_at = CURRENT_DATE WHERE user_id = ? RETURNING user_id',
      args: [payload.userId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Account deactivated successfully. Contact support to reactivate.' 
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { message: 'Failed to deactivate account' },
      { status: 500 }
    );
  }
} 