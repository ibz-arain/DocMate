import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCurrentUsage } from '@/lib/usage-utils';
import { db } from '@/lib/db';

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
    const timeRange = searchParams.get('timeRange') || '30d';
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
    let startDate: Date;
    
    switch (timeRange) {
      case '12h':
        startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '3d':
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();
    
    // Get graph data based on graphType
    let graphData;
    if (graphType === 'hourly') {
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
    } else if (graphType === 'daily') {
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
    } else {
      // Weekly
      graphData = await db.execute({
        sql: `
          SELECT 
            strftime('%Y-W%W', timestamp) as time_bucket,
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