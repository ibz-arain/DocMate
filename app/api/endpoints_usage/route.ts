import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
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

// GET - Fetch usage data for endpoints
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const endpointId = searchParams.get('endpointId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') || '100';
    const page = searchParams.get('page') || '1';
    
    // Start building the SQL query
    let sqlBase = `
      FROM api_usage u
      JOIN api_endpoints e ON u.endpoint_id = e.id
      WHERE e.user_id = ?
    `;
    
    const args: any[] = [String(user.userId)];
    
    // Add filters if provided
    if (endpointId) {
      sqlBase += ` AND u.endpoint_id = ?`;
      args.push(endpointId);
    }
    
    if (startDate) {
      sqlBase += ` AND u.timestamp >= ?`;
      args.push(startDate);
    }
    
    if (endDate) {
      sqlBase += ` AND u.timestamp <= ?`;
      args.push(endDate);
    }
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total ${sqlBase}`,
      args: [...args],
    });
    
    // Get the actual usage data
    const usageResult = await db.execute({
      sql: `
        SELECT 
          u.*,
          e.name as endpoint_name,
          e.path as endpoint_path,
          e.method as endpoint_method
        ${sqlBase}
        ORDER BY u.timestamp DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limitNum, offset],
    });
    
    // If we're requesting a specific endpoint, get summary stats
    let summary = null;
    if (endpointId) {
      const summaryResult = await db.execute({
        sql: `
          SELECT 
            COUNT(*) as total_requests,
            AVG(response_time_ms) as avg_response_time,
            MAX(response_time_ms) as max_response_time,
            MIN(response_time_ms) as min_response_time,
            SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as successful_requests,
            SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_requests
          ${sqlBase}
        `,
        args: [...args],
      });
      
      if (summaryResult.rows.length > 0) {
        summary = summaryResult.rows[0];
      }
    }

    return NextResponse.json({
      data: usageResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0]?.total as string || '0', 10),
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(parseInt(countResult.rows[0]?.total as string || '0', 10) / limitNum)
      },
      summary
    });
  } catch (error) {
    console.error('[USAGE_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Record a new API usage entry
export async function POST(req: Request) {
  try {
    // For API usage tracking, we'll use an API key for authentication instead of cookies
    const { headers } = req;
    const apiKey = headers.get('x-api-key');
    
    if (!apiKey) {
      return new NextResponse("API Key Required", { status: 401 });
    }
    
    // Find the endpoint associated with this API key
    const endpoint = await db.execute({
      sql: 'SELECT * FROM api_endpoints WHERE api_key = ?',
      args: [apiKey],
    });
    
    if (!endpoint.rows.length) {
      return new NextResponse("Invalid API Key", { status: 401 });
    }
    
    const endpointId = endpoint.rows[0].id;
    
    // Get usage data from the request
    const body = await req.json();
    const { 
      status_code,
      response_time_ms,
      request_size_bytes,
      response_size_bytes,
      ip_address,
      user_agent
    } = body;
    
    // Validate required fields
    if (!status_code || !response_time_ms) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Record the usage
    const usage = await db.execute({
      sql: `
        INSERT INTO api_usage (
          endpoint_id,
          timestamp,
          status_code,
          response_time_ms,
          request_size_bytes,
          response_size_bytes,
          ip_address,
          user_agent
        ) VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        endpointId,
        status_code,
        response_time_ms,
        request_size_bytes || null,
        response_size_bytes || null,
        ip_address || null,
        user_agent || null
      ],
    });
    
    // Update the last_used timestamp for the endpoint
    await db.execute({
      sql: 'UPDATE api_endpoints SET last_used = datetime("now") WHERE id = ?',
      args: [endpointId],
    });

    return NextResponse.json(usage.rows[0]);
  } catch (error) {
    console.error('[USAGE_POST]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Clear usage history for an endpoint
export async function DELETE(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const endpointId = searchParams.get('endpointId');
    const beforeDate = searchParams.get('beforeDate');
    
    if (!endpointId) {
      return NextResponse.json({ error: 'Endpoint ID required' }, { status: 400 });
    }
    
    // Verify the endpoint belongs to the user
    const endpoint = await db.execute({
      sql: 'SELECT * FROM api_endpoints WHERE id = ? AND user_id = ?',
      args: [endpointId, String(user.userId)],
    });
    
    if (!endpoint.rows.length) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
    
    // Build delete query
    let sql = 'DELETE FROM api_usage WHERE endpoint_id = ?';
    const args: any[] = [endpointId];
    
    // Add date filter if provided
    if (beforeDate) {
      sql += ' AND timestamp < ?';
      args.push(beforeDate);
    }
    
    // Execute the delete
    const result = await db.execute({
      sql,
      args,
    });
    
    return NextResponse.json({ 
      message: 'Usage data deleted successfully',
      deleted: result.rowsAffected
    });
  } catch (error) {
    console.error('[USAGE_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 