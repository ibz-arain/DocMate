import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });

    const userRow = result.rows[0];
    if (!userRow) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = {
      id: userRow.id as number,
      username: userRow.username as string,
      password: userRow.password as string,
      created_at: userRow.created_at as string
    };

    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id,
      username: user.username
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to log in' },
      { status: 500 }
    );
  }
} 