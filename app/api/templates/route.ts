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

async function getUserFromToken(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new NextResponse("Unauthorized - No token", { status: 401 });
    }

    const user = await getUserFromToken(token);

    if (!user?.userId) {
      return new NextResponse("Unauthorized - Invalid token", { status: 401 });
    }

    const templates = await db.execute({
      sql: `
        SELECT * FROM templates 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `,
      args: [user.userId],
    });

    return NextResponse.json(templates.rows);
  } catch (error) {
    console.error('[TEMPLATES_GET]', error);
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
    if (!user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, tables } = body;

    // Validate required fields
    if (!name || !tables) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await db.execute({
      sql: `
        INSERT INTO templates (
          id,
          user_id,
          name,
          tables,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        RETURNING *
      `,
      args: [
        nanoid(),
        user.userId,
        name,
        JSON.stringify(tables),
      ],
    });

    return NextResponse.json(template.rows[0]);
  } catch (error) {
    console.error('[TEMPLATES_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const template = await db.execute({
      sql: 'SELECT * FROM templates WHERE id = ? AND user_id = ?',
      args: [templateId, user.userId],
    });

    if (!template.rows.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await db.execute({
      sql: 'DELETE FROM templates WHERE id = ? AND user_id = ?',
      args: [templateId, user.userId],
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('[TEMPLATE_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 