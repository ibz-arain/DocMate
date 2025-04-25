import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.log("API /me: No session or user ID found");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      console.error("API /me: Invalid user ID format in session", session.user.id);
      return NextResponse.json(
        { error: 'Invalid user session data' },
        { status: 400 }
      );
    }

    console.log(`API /me: Session found for user ID: ${userId}`);

    const result = await client.execute({
      sql: 'SELECT id, username, created_at FROM users WHERE id = ?',
      args: [userId]
    });

    if (result.rows.length === 0) {
      console.error(`API /me: User not found in DB for ID: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    console.log(`API /me: Returning user data for ID: ${userId}`, user);
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error getting current user (/api/users/me):', error);
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
} 