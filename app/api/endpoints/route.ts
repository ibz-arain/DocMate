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

// GET - Fetch all endpoints for the authenticated user
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

    // Check if we need to filter by template ID
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');
    
    let sql = `
      SELECT e.*, t.name as template_name 
      FROM api_endpoints e
      LEFT JOIN templates t ON e.template_id = t.id
      WHERE e.user_id = ?
    `;
    
    // Cast userId to string if needed for SQLite compatibility
    const args = [String(user.userId)];
    
    if (templateId) {
      sql += ` AND e.template_id = ?`;
      args.push(templateId);
    }
    
    sql += ` ORDER BY e.created_at DESC`;

    const endpoints = await db.execute({
      sql,
      args,
    });

    return NextResponse.json(endpoints.rows);
  } catch (error) {
    console.error('[ENDPOINTS_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Create a new API endpoint
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
    const { 
      id,
      name, 
      path, 
      method, 
      status, 
      template_id,
      auth_enabled,
      rate_limit_enabled,
      rate_limit_requests,
      rate_limit_period,
      webhook_url,
      webhook_events
    } = body;

    // Validate required fields
    if (!id || !name || !path || !method) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate method
    if (method !== 'GET' && method !== 'POST') {
      return new NextResponse("Method must be GET or POST", { status: 400 });
    }

    // Generate a new API key
    const apiKey = `docm_${Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const endpoint = await db.execute({
      sql: `
        INSERT INTO api_endpoints (
          id,
          user_id,
          template_id,
          name,
          path,
          method,
          status,
          api_key,
          auth_enabled,
          rate_limit_enabled,
          rate_limit_requests,
          rate_limit_period,
          webhook_url,
          webhook_events,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        RETURNING *
      `,
      args: [
        id,
        String(user.userId),
        template_id || null,
        name,
        path,
        method,
        status || 'active',
        apiKey,
        auth_enabled !== undefined ? auth_enabled : true,
        rate_limit_enabled !== undefined ? rate_limit_enabled : true,
        rate_limit_requests || 100,
        rate_limit_period || 'minute',
        webhook_url || null,
        webhook_events ? JSON.stringify(webhook_events) : null,
      ],
    });

    return NextResponse.json(endpoint.rows[0]);
  } catch (error) {
    console.error('[ENDPOINTS_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT - Update an existing API endpoint
export async function PUT(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const endpointId = searchParams.get('id');

    if (!endpointId) {
      return new NextResponse("Endpoint ID required", { status: 400 });
    }

    // Check if endpoint exists and belongs to user
    const existingEndpoint = await db.execute({
      sql: 'SELECT * FROM api_endpoints WHERE id = ? AND user_id = ?',
      args: [endpointId, String(user.userId)],
    });

    if (!existingEndpoint.rows.length) {
      return new NextResponse("Endpoint not found", { status: 404 });
    }

    const body = await req.json();
    const { 
      name, 
      path, 
      method, 
      status, 
      template_id,
      auth_enabled,
      rate_limit_enabled,
      rate_limit_requests,
      rate_limit_period,
      webhook_url,
      webhook_events,
      api_key
    } = body;

    // Build the SQL update statement dynamically
    let sql = 'UPDATE api_endpoints SET updated_at = datetime("now")';
    const args: any[] = [];

    if (name !== undefined) {
      sql += ', name = ?';
      args.push(name);
    }

    if (path !== undefined) {
      sql += ', path = ?';
      args.push(path);
    }

    if (method !== undefined) {
      if (method !== 'GET' && method !== 'POST') {
        return new NextResponse("Method must be GET or POST", { status: 400 });
      }
      sql += ', method = ?';
      args.push(method);
    }

    if (status !== undefined) {
      if (status !== 'active' && status !== 'inactive') {
        return new NextResponse("Status must be active or inactive", { status: 400 });
      }
      sql += ', status = ?';
      args.push(status);
    }

    if (template_id !== undefined) {
      sql += ', template_id = ?';
      args.push(template_id || null);
    }

    if (auth_enabled !== undefined) {
      sql += ', auth_enabled = ?';
      args.push(auth_enabled);
    }

    if (rate_limit_enabled !== undefined) {
      sql += ', rate_limit_enabled = ?';
      args.push(rate_limit_enabled);
    }

    if (rate_limit_requests !== undefined) {
      sql += ', rate_limit_requests = ?';
      args.push(rate_limit_requests);
    }

    if (rate_limit_period !== undefined) {
      sql += ', rate_limit_period = ?';
      args.push(rate_limit_period);
    }

    if (webhook_url !== undefined) {
      sql += ', webhook_url = ?';
      args.push(webhook_url);
    }

    if (webhook_events !== undefined) {
      sql += ', webhook_events = ?';
      args.push(JSON.stringify(webhook_events));
    }

    if (api_key !== undefined) {
      sql += ', api_key = ?';
      args.push(api_key);
    }

    // Finish the SQL statement
    sql += ' WHERE id = ? AND user_id = ? RETURNING *';
    args.push(endpointId);
    args.push(String(user.userId));

    const result = await db.execute({
      sql,
      args,
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[ENDPOINTS_PUT]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Remove an API endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpointId = searchParams.get('id');

    if (!endpointId) {
      return NextResponse.json({ error: 'Endpoint ID required' }, { status: 400 });
    }

    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Check if endpoint exists and belongs to user
    const endpoint = await db.execute({
      sql: 'SELECT * FROM api_endpoints WHERE id = ? AND user_id = ?',
      args: [endpointId, String(user.userId)],
    });

    if (!endpoint.rows.length) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    // Delete the endpoint
    await db.execute({
      sql: 'DELETE FROM api_endpoints WHERE id = ? AND user_id = ?',
      args: [endpointId, String(user.userId)],
    });

    return NextResponse.json({ message: 'Endpoint deleted successfully' });
  } catch (error) {
    console.error('[ENDPOINT_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 