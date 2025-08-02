import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCurrentUsage } from '@/lib/usage-utils';
import { db } from '@/lib/db';

// Helper function to add some real test data
const addTestData = async (userId: number, startDate: Date, endDate: Date) => {
  const endpoints = ['chat', 'analyze', 'summarize'];
  const testData = [];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Add 1-5 API calls per day with realistic patterns
    const numCalls = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numCalls; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      // Spread calls throughout the day (9 AM to 6 PM mostly)
      const hour = 9 + Math.floor(Math.random() * 9); // 9 AM to 6 PM
      const minute = Math.floor(Math.random() * 60);
      const timestamp = new Date(currentDate);
      timestamp.setHours(hour, minute, 0, 0);
      
      testData.push({
        user_id: userId,
        endpoint_name: endpoint,
        timestamp: timestamp.toISOString(),
        status_code: Math.random() > 0.1 ? 200 : 500, // 90% success rate
        response_time_ms: Math.floor(Math.random() * 200) + 50,
        request_size_bytes: Math.floor(Math.random() * 1000) + 100,
        response_size_bytes: Math.floor(Math.random() * 5000) + 500,
        input_description: `Test ${endpoint} call ${i + 1}`
      });
    }
    
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  // Insert test data
  for (const data of testData) {
    await db.execute({
      sql: `
        INSERT INTO user_usage 
        (user_id, endpoint_name, timestamp, status_code, response_time_ms, request_size_bytes, response_size_bytes, input_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        data.user_id,
        data.endpoint_name,
        data.timestamp,
        data.status_code,
        data.response_time_ms,
        data.request_size_bytes,
        data.response_size_bytes,
        data.input_description
      ]
    });
  }
};

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // Default to 7 days
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const endpointFilter = searchParams.get('endpoint') || 'all';
    const graphType = searchParams.get('graphType') || 'hourly';

    // Get current usage
    const currentUsage = await getCurrentUsage(user.userId);
    
    // Calculate date range based on timeRange
    const now = new Date();
    console.log('🔍 DEBUG - Current time:', {
      now: now.toISOString(),
      nowLocal: now.toString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: now.getTimezoneOffset()
    });
    
    let startDate: Date;
    
    switch (timeRange) {
      case '12h':
        startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        // Start from 7 days ago from current date
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        // Calculate 6 months ago from current date
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '12m':
        // Calculate 12 months ago from current date
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    console.log('🔍 DEBUG - Date calculations:', {
      timeRange,
      startDate: startDate.toISOString(),
      startDateLocal: startDate.toString(),
      timeDiff: now.getTime() - startDate.getTime(),
      timeDiffHours: (now.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    });

    const startDateStr = startDate.toISOString();
    console.log('🔍 DEBUG - Start date string:', startDateStr);
    
    // Check if user has any usage data
    const hasData = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM user_usage WHERE user_id = ?',
      args: [user.userId]
    });
    
    // If no data exists, add some test data
    if (hasData.rows[0]?.count === 0) {
      await addTestData(user.userId, startDate, now);
    }
    
    // Get graph data based on time range (not graphType)
    let graphData;
    console.log('🔍 DEBUG - Querying graph data with timeRange:', timeRange, 'startDateStr:', startDateStr);
    
    if (timeRange === '12h' || timeRange === '24h') {
      // For hourly views, group by hour
      graphData = await db.execute({
        sql: `
          SELECT 
            strftime('%Y-%m-%d %H:00:00', timestamp) as time_bucket,
            COUNT(*) as call_count,
            AVG(response_time_ms) as avg_response_time,
            COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success_count
          FROM user_usage 
          WHERE user_id = ? AND timestamp >= ?
          GROUP BY time_bucket
          ORDER BY time_bucket ASC
        `,
        args: [user.userId, startDateStr]
      });
    } else if (timeRange === '6m' || timeRange === '12m') {
      // For 6 months and 12 months, group by month
      graphData = await db.execute({
        sql: `
          SELECT 
            strftime('%Y-%m', timestamp) as time_bucket,
            COUNT(*) as call_count,
            AVG(response_time_ms) as avg_response_time,
            COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success_count
          FROM user_usage 
          WHERE user_id = ? AND timestamp >= ?
          GROUP BY time_bucket
          ORDER BY time_bucket ASC
        `,
        args: [user.userId, startDateStr]
      });
    } else {
      // For daily views (7d, 30d), group by day
      graphData = await db.execute({
        sql: `
          SELECT 
            DATE(timestamp) as time_bucket,
            COUNT(*) as call_count,
            AVG(response_time_ms) as avg_response_time,
            COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success_count
          FROM user_usage 
          WHERE user_id = ? AND timestamp >= ?
          GROUP BY time_bucket
          ORDER BY time_bucket ASC
        `,
        args: [user.userId, startDateStr]
      });
    }
    
    console.log('🔍 DEBUG - Graph data result:', {
      rowCount: graphData.rows?.length || 0,
      firstRow: graphData.rows?.[0],
      lastRow: graphData.rows?.[graphData.rows.length - 1]
    });
    
    // Ensure we always have graph data structure
    if (!graphData.rows || graphData.rows.length === 0) {
      graphData.rows = [];
    }

    // Build WHERE clause for filtering
    let whereConditions = ['user_id = ?'];
    let args: (string | number)[] = [user.userId];
    
    if (search) {
      whereConditions.push('(input_description LIKE ? OR endpoint_name LIKE ?)');
      args.push(`%${search}%`, `%${search}%`);
    }
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'success') {
        whereConditions.push('status_code >= 200 AND status_code < 300');
      } else if (statusFilter === 'error') {
        whereConditions.push('(status_code < 200 OR status_code >= 300)');
      }
    }
    
    if (endpointFilter !== 'all') {
      whereConditions.push('endpoint_name = ?');
      args.push(endpointFilter);
    }
    
    whereConditions.push('timestamp >= ?');
    args.push(startDateStr);

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get paginated usage data
    const usageData = await db.execute({
      sql: `
        SELECT 
          endpoint_name,
          input_description,
          timestamp,
          status_code,
          response_time_ms,
          request_size_bytes,
          response_size_bytes
        FROM user_usage 
        WHERE ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit as number, offset as number]
    });

    // Get total count for pagination
    const totalCount = await db.execute({
      sql: `
        SELECT COUNT(*) as total
        FROM user_usage 
        WHERE ${whereClause}
      `,
      args: args
    });

    // Get plan renewal info
    const planInfo = await db.execute({
      sql: `
        SELECT plan_type, created_at
        FROM users 
        WHERE user_id = ?
      `,
      args: [user.userId]
    });

    const userPlan = planInfo.rows[0];
    const createdAt = new Date(userPlan.created_at as string);
    
    // Calculate next renewal date based on billing cycle
    const currentDate = new Date();
    const billingDay = createdAt.getDate(); // Get the day of month when billing started
    
    // Calculate next renewal date
    let nextRenewal = new Date(currentDate.getFullYear(), currentDate.getMonth(), billingDay);
    
    // If the billing day has passed this month, next renewal is next month
    if (currentDate.getDate() >= billingDay) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
    
    // Ensure we're not going back in time
    if (nextRenewal <= currentDate) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }

    const totalCountValue = totalCount.rows[0]?.total as number || 0;
    
    return NextResponse.json({
      success: true,
      current_usage: currentUsage,
      graph_data: graphData.rows,
      usage_data: usageData.rows,
      pagination: {
        page,
        limit,
        total: totalCountValue,
        totalPages: Math.ceil(totalCountValue / limit)
      },
      plan_info: {
        plan_type: userPlan.plan_type as string,
        next_renewal: nextRenewal.toISOString(),
        created_at: userPlan.created_at as string
      },
      filters: {
        timeRange,
        graphType,
        search,
        statusFilter,
        endpointFilter
      }
    });

  } catch (error) {
    console.error('Usage API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 