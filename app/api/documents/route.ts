import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { verify } from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
  username: string;
  iat: number;
  exp: number;
}

async function getUserFromToken(token: string) {
  try {
    console.log('Verifying token with secret:', process.env.JWT_SECRET?.slice(0, 5) + '...');
    const decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;
    console.log('Decoded token:', decoded);
    return {
      id: decoded.userId,
      username: decoded.username
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    console.log('Auth token from cookie:', token ? token.slice(0, 10) + '...' : 'null');

    if (!token) {
      return new NextResponse("Unauthorized - No token", { status: 401 });
    }

    const user = await getUserFromToken(token);
    console.log('User from token:', user);

    if (!user?.id) {
      return new NextResponse("Unauthorized - Invalid token", { status: 401 });
    }

    console.log('Fetching documents for user:', user.id);

    const documents = await db.execute({
      sql: `
        SELECT * FROM documents 
        WHERE user_id = ? 
        ORDER BY date DESC
      `,
      args: [user.id],
    });

    return NextResponse.json(documents.rows);
  } catch (error) {
    console.error('[DOCUMENTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, type, date, confidence, contentJson } = body;

    // Validate required fields
    if (!title || !type || !date || !contentJson) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate document type
    const validTypes = ['t4', 'bank', 'receipt', 'dental', 'electricity'];
    if (!validTypes.includes(type)) {
      return new NextResponse("Invalid document type", { status: 400 });
    }

    const document = await db.execute({
      sql: `
        INSERT INTO documents (
          id,
          user_id,
          title,
          type,
          date,
          confidence,
          content_json,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        RETURNING *
      `,
      args: [
        nanoid(),
        user.id,
        title,
        type,
        date,
        confidence,
        JSON.stringify(contentJson),
      ],
    });

    return NextResponse.json(document.rows[0]);
  } catch (error) {
    console.error('[DOCUMENTS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 