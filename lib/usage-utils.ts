import { db } from './db';
import { verifyJWT, getTokenFromRequest } from './auth-utils';
import { NextRequest } from 'next/server';

export interface UsageRecord {
  user_id: number;
  endpoint_name: string;
  request_size_bytes?: number;
  response_size_bytes?: number;
  status_code: number;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  input_description?: string;
}

export interface PlanLimits {
  plan_type: string;
  plan_limits: number | null;
}

export interface UsageStatus {
  current_usage: number;
  limit: number | null;
  is_over_limit: boolean;
  period_start: string;
  period_type: 'daily' | 'monthly';
}

/**
 * Get user from request (either from JWT token or other auth method)
 */
export async function getUserFromRequest(req: NextRequest): Promise<{ userId: number; email: string } | null> {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }
  
  return await verifyJWT(token);
}

/**
 * Get user's plan limits
 */
export async function getUserPlanLimits(userId: number): Promise<PlanLimits> {
  const result = await db.execute({
    sql: 'SELECT plan_type, plan_limits FROM users WHERE user_id = ?',
    args: [userId]
  });
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return {
    plan_type: result.rows[0].plan_type as string,
    plan_limits: result.rows[0].plan_limits as number | null
  };
}

/**
 * Get current usage for a user in the current period
 */
export async function getCurrentUsage(userId: number, periodType: 'daily' | 'monthly' = 'monthly'): Promise<UsageStatus> {
  const now = new Date();
  let periodStart: string;
  
  if (periodType === 'daily') {
    periodStart = now.toISOString().split('T')[0]; // YYYY-MM-DD
  } else {
    periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; // YYYY-MM-01
  }
  
  // Get or create usage record for current period
  const usageResult = await db.execute({
    sql: `
      INSERT INTO plan_usage (user_id, period_start, period_type, api_calls_count)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(user_id, period_start, period_type) DO UPDATE SET
        last_updated = CURRENT_TIMESTAMP
      RETURNING api_calls_count
    `,
    args: [userId, periodStart, periodType]
  });
  
  const currentUsage = usageResult.rows[0]?.api_calls_count as number || 0;
  
  // Get user's plan limits
  const planLimits = await getUserPlanLimits(userId);
  
  return {
    current_usage: currentUsage,
    limit: planLimits.plan_limits,
    is_over_limit: planLimits.plan_limits ? currentUsage >= planLimits.plan_limits : false,
    period_start: periodStart,
    period_type: periodType
  };
}

/**
 * Record API usage for a user
 */
export async function recordApiUsage(usage: UsageRecord): Promise<void> {
  // Record detailed usage
  await db.execute({
    sql: `
      INSERT INTO user_usage 
      (user_id, endpoint_name, request_size_bytes, response_size_bytes, status_code, response_time_ms, ip_address, user_agent, input_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      usage.user_id,
      usage.endpoint_name,
      usage.request_size_bytes || null,
      usage.response_size_bytes || null,
      usage.status_code,
      usage.response_time_ms || null,
      usage.ip_address || null,
      usage.user_agent || null,
      usage.input_description || null
    ]
  });
  
  // Update plan usage counter
  const now = new Date();
  const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; // Monthly period
  
  await db.execute({
    sql: `
      INSERT INTO plan_usage (user_id, period_start, period_type, api_calls_count)
      VALUES (?, ?, 'monthly', 1)
      ON CONFLICT(user_id, period_start, period_type) DO UPDATE SET
        api_calls_count = api_calls_count + 1,
        last_updated = CURRENT_TIMESTAMP
    `,
    args: [usage.user_id, periodStart]
  });
}

/**
 * Check if user is over their API limit
 */
export async function checkRateLimit(userId: number): Promise<{ allowed: boolean; usage?: UsageStatus }> {
  const usage = await getCurrentUsage(userId);
  
  if (usage.is_over_limit) {
    return { allowed: false, usage };
  }
  
  return { allowed: true, usage };
}

/**
 * Get request size in bytes
 */
export function getRequestSize(req: NextRequest): number {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10);
  }
  return 0;
}

/**
 * Get response size in bytes
 */
export function getResponseSize(response: Response): number {
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10);
  }
  return 0;
}

/**
 * Get client IP address
 */
export function getClientIP(req: NextRequest): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         undefined;
}

/**
 * Get user agent
 */
export function getUserAgent(req: NextRequest): string | undefined {
  return req.headers.get('user-agent') || undefined;
} 