import { NextRequest, NextResponse } from 'next/server';
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

// Helper function to get user's timezone from request headers
const getUserTimezone = (req: NextRequest): string => {
  // Try to get timezone from various headers
  const timezone = req.headers.get('x-timezone') || 
                   req.headers.get('timezone') || 
                   req.headers.get('x-user-timezone') ||
                   'UTC';
  return timezone;
};

// Helper function to convert UTC timestamp to user's timezone
const convertToUserTimezone = (utcTimestamp: string, timezone: string): string => {
  try {
    const date = new Date(utcTimestamp);
    return date.toLocaleString('en-CA', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    return utcTimestamp;
  }
};

async function getUserFromToken(token: string): Promise<DecodedToken | null> {
  try {
    console.log('Verifying token with secret:', process.env.JWT_SECRET?.slice(0, 5) + '...');
    const decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;
    console.log('Decoded token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    console.log('Auth token from cookie:', token ? token.slice(0, 10) + '...' : 'null');

    if (!token) {
      return new NextResponse("Unauthorized - No token", { status: 401 });
    }

    const user = await getUserFromToken(token);
    console.log('User from token:', user);

    if (!user?.userId) {
      return new NextResponse("Unauthorized - Invalid token", { status: 401 });
    }

    // Get user's timezone
    const userTimezone = getUserTimezone(req);

    console.log('Fetching documents for user:', user.userId);

    const documents = await db.execute({
      sql: `
        SELECT * FROM documents 
        WHERE user_id = ? 
        ORDER BY date DESC
      `,
      args: [user.userId],
    });

    // Convert timestamps to user's timezone
    if (documents.rows && documents.rows.length > 0) {
      documents.rows = documents.rows.map((row: any) => ({
        ...row,
        created_at: row.created_at ? convertToUserTimezone(String(row.created_at), userTimezone) : row.created_at,
        updated_at: row.updated_at ? convertToUserTimezone(String(row.updated_at), userTimezone) : row.updated_at
      }));
    }

    return NextResponse.json(documents.rows);
  } catch (error) {
    console.error('[DOCUMENTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's timezone
    const userTimezone = getUserTimezone(req);

    const body = await req.json();
    const { title, type, date, confidence, contentJson } = body;

    // Validate required fields
    if (!title || !type || !date || !contentJson) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // We no longer validate against a fixed list of types
    // Allow any string as a type - this supports custom templates
    
    console.log('Saving document with type:', type);

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
        user.userId,
        title,
        type,
        date,
        confidence,
        JSON.stringify(contentJson),
      ],
    });

    // Convert timestamps to user's timezone
    if (document.rows && document.rows.length > 0) {
      document.rows[0] = {
        ...document.rows[0],
        created_at: document.rows[0].created_at ? convertToUserTimezone(String(document.rows[0].created_at), userTimezone) : document.rows[0].created_at,
        updated_at: document.rows[0].updated_at ? convertToUserTimezone(String(document.rows[0].updated_at), userTimezone) : document.rows[0].updated_at
      };
    }

    return NextResponse.json(document.rows[0]);
  } catch (error) {
    console.error('[DOCUMENTS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const document = await db.execute({
      sql: 'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      args: [documentId, user.userId],
    });

    if (!document.rows.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await db.execute({
      sql: 'DELETE FROM documents WHERE id = ? AND user_id = ?',
      args: [documentId, user.userId],
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[DOCUMENT_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 