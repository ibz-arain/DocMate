import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

interface DecodedToken {
  userId: number;
  username: string;
  iat: number;
  exp: number;
}

async function getUserFromToken(token: string) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return {
      id: decoded.userId,
      username: decoded.username
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new NextResponse("Unauthorized - No token", { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user?.id) {
      return new NextResponse("Unauthorized - Invalid token", { status: 401 });
    }

    const { documentId } = params;
    if (!documentId) {
      return new NextResponse("Document ID required", { status: 400 });
    }

    // First verify the document belongs to the user
    const document = await db.execute({
      sql: `
        SELECT * FROM documents 
        WHERE id = ? AND user_id = ?
      `,
      args: [documentId, user.id],
    });

    if (!document.rows.length) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Delete the document
    await db.execute({
      sql: `
        DELETE FROM documents 
        WHERE id = ? AND user_id = ?
      `,
      args: [documentId, user.id],
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DOCUMENT_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 