import { db } from './db';

export interface PlanConfig {
  plan_type: string;
  plan_limits: number;
  description: string;
}

export const DEFAULT_PLANS: PlanConfig[] = [
  {
    plan_type: 'free',
    plan_limits: 50,
    description: 'Free tier with 50 API calls per month'
  },
  {
    plan_type: 'basic',
    plan_limits: 500,
    description: 'Basic plan with 500 API calls per month'
  },
  {
    plan_type: 'pro',
    plan_limits: 5000,
    description: 'Pro plan with 5000 API calls per month'
  },
  {
    plan_type: 'enterprise',
    plan_limits: 50000,
    description: 'Enterprise plan with 50000 API calls per month'
  }
];

/**
 * Set a user's plan and limits
 */
export async function setUserPlan(userId: number, planType: string, customLimit?: number): Promise<void> {
  const plan = DEFAULT_PLANS.find(p => p.plan_type === planType);
  
  if (!plan && !customLimit) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  
  const planLimits = customLimit || plan?.plan_limits || 50;
  
  await db.execute({
    sql: 'UPDATE users SET plan_type = ?, plan_limits = ?, updated_at = CURRENT_DATE WHERE user_id = ?',
    args: [planType, planLimits, userId]
  });
}

/**
 * Get plan information
 */
export function getPlanInfo(planType: string): PlanConfig | null {
  return DEFAULT_PLANS.find(p => p.plan_type === planType) || null;
}

/**
 * Get all available plans
 */
export function getAllPlans(): PlanConfig[] {
  return DEFAULT_PLANS;
}

/**
 * Check if a plan type is valid
 */
export function isValidPlanType(planType: string): boolean {
  return DEFAULT_PLANS.some(p => p.plan_type === planType);
}

/**
 * Get user's current plan info
 */
export async function getUserPlanInfo(userId: number): Promise<{ plan_type: string; plan_limits: number | null; plan_info?: PlanConfig }> {
    const result = await db.execute({
    sql: 'SELECT plan_type, plan_limits FROM users WHERE user_id = ?',
      args: [userId]
    });

    if (result.rows.length === 0) {
    throw new Error('User not found');
    }

  const planType = result.rows[0].plan_type as string;
  const planLimits = result.rows[0].plan_limits as number | null;
  const planInfo = getPlanInfo(planType);

    return {
    plan_type: planType,
    plan_limits: planLimits,
    plan_info: planInfo || undefined
  };
}

// Get user's current usage for the current month
export async function getUserUsage(userId: number, currentMonth?: string) {
  try {
    const month = currentMonth || new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const result = await db.execute({
      sql: `SELECT COUNT(*) as usage_count 
            FROM user_usage 
            WHERE user_id = ? 
            AND strftime('%Y-%m', timestamp) = ?`,
      args: [userId, month]
    });

    return Number(result.rows[0]?.usage_count) || 0;
  } catch (error) {
    console.error('Error getting user usage:', error);
    return 0;
  }
}

// Check if user has exceeded their plan limits
export async function checkUserLimits(userId: number) {
  try {
    const userPlan = await getUserPlanInfo(userId);
    if (!userPlan) {
      return { allowed: false, reason: 'User not found' };
    }

    const { plan_limits } = userPlan;
    const currentUsage = await getUserUsage(userId);
    const limit = plan_limits;

    // Unlimited plan
    if (limit === -1) {
      return { allowed: true, currentUsage, limit: 'unlimited' };
    }

    // Check if user has exceeded their limit
    if (limit && currentUsage >= limit) {
      return { 
        allowed: false, 
        currentUsage, 
        limit,
        reason: `Monthly limit of ${limit} document analyses exceeded` 
      };
    }

    return { allowed: true, currentUsage, limit };
  } catch (error) {
    console.error('Error checking user limits:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
}

// Increment user usage
export async function incrementUserUsage(userId: number, endpointId: string) {
  try {
    // Record the API usage
    await db.execute({
      sql: `INSERT INTO user_usage (
        user_id,
        endpoint_name,
        timestamp,
        status_code,
        response_time_ms,
        request_size_bytes,
        response_size_bytes,
        ip_address,
        user_agent
      ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        'api_endpoint',
        200,
        0, // response_time_ms will be updated by the calling function
        0, // request_size_bytes
        0, // response_size_bytes
        'unknown', // ip_address
        'unknown'  // user_agent
      ]
    });

    return true;
  } catch (error) {
    console.error('Error incrementing user usage:', error);
    return false;
  }
}

// Get plan features
export function getPlanFeatures(planType: string) {
  const plan = DEFAULT_PLANS.find(p => p.plan_type === planType);
  if (!plan) {
    return [];
  }
  return plan.description.split('per month')[0].split('with ')[1].split('API calls')[0].split(' ').filter(Boolean);
}

// Get plan limits
export function getPlanLimits(planType: string) {
  const plan = DEFAULT_PLANS.find(p => p.plan_type === planType);
  if (!plan) {
    return 0;
  }
  return plan.plan_limits;
} 