import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getCurrentUsage } from '@/lib/usage-utils';
import { db } from '@/lib/db';

// Helper function to get user's timezone from request headers
const getUserTimezone = (req: NextRequest): string => {
  // Try to get timezone from various headers
  const timezone = req.headers.get('x-timezone') || 
                   req.headers.get('timezone') || 
                   req.headers.get('x-user-timezone') ||
                   'UTC';
  console.log('🔍 Timezone detection:', {
    'x-timezone': req.headers.get('x-timezone'),
    'timezone': req.headers.get('timezone'),
    'x-user-timezone': req.headers.get('x-user-timezone'),
    'final-timezone': timezone
  });
  return timezone;
};

// Helper function to convert UTC timestamp to user's timezone
const convertToUserTimezone = (utcTimestamp: string, timezone: string): string => {
  try {
    let date: Date;
    
    // Handle the specific format stored in your database: "YYYY-MM-DD HH:mm:ss"
    if (utcTimestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // This is your database format - treat as UTC and convert to local
      const [datePart, timePart] = utcTimestamp.split(' ');
      date = new Date(`${datePart}T${timePart}.000Z`); // Force UTC interpretation
    } else {
      // Handle other formats (ISO strings, etc.)
      date = new Date(utcTimestamp);
    }
    
    const converted = date.toLocaleString('en-CA', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
    
    console.log('🕐 Timezone conversion:', {
      original: utcTimestamp,
      timezone: timezone,
      converted: converted,
      isUTC: date.toISOString()
    });
    return converted;
  } catch (error) {
    console.log('❌ Timezone conversion failed:', {
      original: utcTimestamp,
      timezone: timezone,
      error: error
    });
    // Fallback to UTC if timezone is invalid
    return utcTimestamp;
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

    // Get user's timezone
    const userTimezone = getUserTimezone(req);

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // Default to 7 days
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const endpointFilter = searchParams.get('endpoint') || 'all';

    // Get current usage
    const currentUsage = await getCurrentUsage(user.userId);
    
    // Calculate date range based on timeRange in user's timezone
    const now = new Date();
    
    // Get current time in user's timezone
    const userNow = new Date();
    const userNowStr = userNow.toLocaleString('en-CA', { timeZone: userTimezone });
    
    let startDate: Date;
    
    switch (timeRange) {
      case '12h':
        startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        // Calculate 7 days ago from current date
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        startDate = sevenDaysAgo;
        break;
      case '30d':
        // Calculate 30 days ago from current date
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate = thirtyDaysAgo;
        break;
      case '6m':
        // Calculate 6 months ago from current date
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        startDate = sixMonthsAgo;
        break;
      case '12m':
        // Calculate 12 months ago from current date
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        startDate = twelveMonthsAgo;
        break;
      default:
        const defaultDaysAgo = new Date();
        defaultDaysAgo.setDate(defaultDaysAgo.getDate() - 7);
        startDate = defaultDaysAgo;
    }

    // Convert to database format for comparison (YYYY-MM-DD HH:mm:ss)
    const dbStartDate = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const startDateStr = startDate.toISOString();
    
    console.log('🔍 Date range calculation:', {
      timeRange,
      startDate: startDateStr,
      dbStartDate,
      now: now.toISOString(),
      userNow: userNowStr,
      userTimezone,
      startDateLocal: startDate.toLocaleString('en-CA', { timeZone: userTimezone })
    });
    
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
    args.push(dbStartDate);

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Get ALL usage data for the time range (no grouping, no limiting by page)
    console.log('🔍 SQL Query:', {
      whereClause,
      args,
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
      `
    });
    
    const allUsageData = await db.execute({
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
      `,
      args: args
    });

    // Convert all timestamps to user's timezone
    console.log('📋 Converting all usage data timestamps:', {
      timezone: userTimezone,
      rowCount: allUsageData.rows?.length || 0
    });
    
    if (allUsageData.rows && allUsageData.rows.length > 0) {
      allUsageData.rows = allUsageData.rows.map((row: any) => ({
        ...row,
        timestamp: convertToUserTimezone(row.timestamp, userTimezone)
      }));
    }

    // Get paginated data for the response
    const paginatedData = allUsageData.rows.slice(offset, offset + limit);

    // Get total count for pagination
    const totalCount = allUsageData.rows.length;

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

    console.log('🎯 Final response with timezone:', userTimezone);
    return NextResponse.json({
      success: true,
      current_usage: currentUsage,
      // Return ALL data for client-side processing
      all_usage_data: allUsageData.rows,
      // Return paginated data for immediate display
      usage_data: paginatedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      plan_info: {
        plan_type: userPlan.plan_type as string,
        next_renewal: convertToUserTimezone(nextRenewal.toISOString(), userTimezone),
        created_at: convertToUserTimezone(userPlan.created_at as string, userTimezone)
      },
      filters: {
        timeRange,
        search,
        statusFilter,
        endpointFilter
      },
      timezone: userTimezone
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