import { db } from './db';

export interface PlanConfig {
  plan_type: string;
  description: string;
}

export const DEFAULT_PLANS: PlanConfig[] = [
  {
    plan_type: 'free',
    description: 'Free tier with 50 API calls per month'
  },
  {
    plan_type: 'hobby',
    description: 'Hobby plan with 500 API calls per month'
  },
  {
    plan_type: 'pro',
    description: 'Pro plan with 1,000 API calls per month'
  },
  {
    plan_type: 'business',
    description: 'Business plan with 5,000 API calls per month'
  },
  {
    plan_type: 'enterprise',
    description: 'Enterprise plan with custom API call limits'
  },
  {
    plan_type: 'custom',
    description: 'Custom plan with unlimited API call limits'
  }
];

/**
 * Set a user's plan and optional custom limits
 */
export async function setUserPlan(userId: number, planType: string, customLimits?: number): Promise<void> {
  const plan = DEFAULT_PLANS.find(p => p.plan_type === planType);
  
  if (!plan && !customLimits) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  
  // If custom limits provided, use those. Otherwise use plan defaults
  const limits = customLimits || getPlanLimits(planType);
  
  await db.execute({
    sql: 'UPDATE users SET plan_type = ?, plan_limits = ?, updated_at = CURRENT_DATE WHERE user_id = ?',
    args: [planType, limits, userId]
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
export async function getUserPlanInfo(userId: number): Promise<{ plan_type: string | null; plan_limits: number | null; plan_info?: PlanConfig }> {
    const result = await db.execute({
    sql: 'SELECT plan_type, plan_limits FROM users WHERE user_id = ?',
      args: [userId]
    });

    if (result.rows.length === 0) {
    throw new Error('User not found');
    }

  const planType = result.rows[0].plan_type as string | null;
  const planLimits = result.rows[0].plan_limits as number | null;
  const planInfo = planType ? getPlanInfo(planType) : null;

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

    let { plan_type, plan_limits } = userPlan;
    
    // If no plan is set, default to free plan limits
    if (!plan_type) {
      plan_type = 'free';
    }
    
    // Use stored plan_limits if available, otherwise fall back to plan type defaults
    let limits: number;
    if (plan_limits !== null && plan_limits !== undefined) {
      limits = plan_limits;
    } else {
      limits = getPlanLimits(plan_type);
    }
    
    const currentUsage = await getUserUsage(userId);

    // Check if user has exceeded their limit
    if (currentUsage >= limits) {
      return { 
        allowed: false, 
        currentUsage, 
        limit: limits,
        reason: `Monthly limit of ${limits} API calls exceeded` 
      };
    }

    return { allowed: true, currentUsage, limit: limits };
  } catch (error) {
    console.error('Error checking user limits:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
}

// Increment user usage
export async function incrementUserUsage(userId: number, endpointName: string, inputDescription?: string) {
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
        user_agent,
        input_description
      ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        endpointName,
        200,
        0, // response_time_ms will be updated by the calling function
        0, // request_size_bytes
        0, // response_size_bytes
        'unknown', // ip_address
        'unknown',  // user_agent
        inputDescription || null
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

// Get plan limits based on plan type
export function getPlanLimits(planType: string): number {
  switch (planType) {
    case 'free':
      return 50;
    case 'hobby':
      return 500;
    case 'pro':
      return 1000;
    case 'business':
      return 5000;
    case 'enterprise':
      return 100000; // Default, but you'll manually override this
    case 'custom':
      return 999999; // Default, but you'll manually override this
    default:
      return 50; // Default to free plan limits
  }
} 