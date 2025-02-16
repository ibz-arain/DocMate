import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// GET /api/users - Get all users (for admin purposes)
export async function GET() {
  try {
    const result = await client.execute('SELECT id, username, created_at FROM users');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user (sign up)
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

    // Check if username already exists
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username]
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await client.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?) RETURNING id, username, created_at',
      args: [username, hashedPassword]
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/:id - Update a user
export async function PUT(request: NextRequest) {
  try {
    const { id, username, password } = await request.json();

    // Validate input
    if (!id || (!username && !password)) {
      return NextResponse.json(
        { error: 'ID and at least one field to update are required' },
        { status: 400 }
      );
    }

    let updates = [];
    let args: any[] = [];

    if (username) {
      updates.push('username = ?');
      args.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      args.push(hashedPassword);
    }

    args.push(id);

    const result = await client.execute({
      sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ? RETURNING id, username, created_at`,
      args
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await client.execute({
      sql: 'DELETE FROM users WHERE id = ? RETURNING id',
      args: [id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 