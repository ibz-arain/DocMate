import { db } from './db';

// Plan configurations
export const PLAN_CONFIGS = {
  free: {
    name: 'Free Forever',
    price: '$0',
    period: '/month',
    document_analyses_per_month: 50,
    features: ['50 document analyses per month', 'Unlimited document and spreadsheet access', 'Document history', 'Email support']
  },
  hobby: {
    name: 'Hobby',
    price: '$19',
    period: '/month',
    document_analyses_per_month: 500,
    features: ['500 document analyses per month', 'Everything in Free Forever', 'Email support']
  },
  pro: {
    name: 'Pro',
    price: '$29',
    period: '/month',
    document_analyses_per_month: 1000,
    features: ['1,000 document analyses per month', 'Everything in Hobby', 'Usage tracking and analytics', 'Email support']
  },
  business: {
    name: 'Business',
    price: '$99',
    period: '/month',
    document_analyses_per_month: 5000,
    features: ['5,000 document analyses per month', 'Everything in Pro', '24/7 phone support', 'Email support']
  },
  enterprise: {
    name: 'Enterprise',
    price: '$179',
    period: '/month',
    document_analyses_per_month: 10000,
    features: ['10,000 document analyses per month', 'Everything in Business', 'Access to our API (for developers)', '24/7 phone support', 'Email support']
  },
  custom: {
    name: 'Contact Us',
    price: '',
    period: '',
    document_analyses_per_month: -1, // Unlimited
    features: ['Unlimited document analyses', 'Pay as you go pricing', 'Everything in Enterprise', 'We can integrate into your apps', '24/7 phone support', 'Email support']
  }
};

export type PlanType = keyof typeof PLAN_CONFIGS;

// Get user's current plan
export async function getUserPlan(userId: number) {
  try {
    const result = await db.execute({
      sql: `SELECT plan_type, plan_limits FROM users WHERE user_id = ? AND is_active = 1`,
      args: [userId]
    });

    if (result.rows.length === 0) {
      return null;
    }

    const userPlan = result.rows[0] as any;
    const planType = userPlan.plan_type || 'free';
    const planConfig = PLAN_CONFIGS[planType as PlanType];
    
    // Handle null plan_limits by using default config
    const planLimits = userPlan.plan_limits ?? planConfig.document_analyses_per_month;

    return {
      planType,
      planConfig,
      planLimits: {
        document_analyses_per_month: planLimits,
        features: planConfig.features
      }
    };
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
}

// Get user's current usage for the current month
export async function getUserUsage(userId: number, currentMonth?: string) {
  try {
    const month = currentMonth || new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const result = await db.execute({
      sql: `SELECT COUNT(*) as usage_count 
            FROM api_usage au 
            JOIN api_endpoints ae ON au.endpoint_id = ae.id 
            WHERE ae.user_id = ? 
            AND strftime('%Y-%m', au.timestamp) = ?`,
      args: [userId, month]
    });

    return result.rows[0]?.usage_count || 0;
  } catch (error) {
    console.error('Error getting user usage:', error);
    return 0;
  }
}

// Check if user has exceeded their plan limits
export async function checkUserLimits(userId: number) {
  try {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      return { allowed: false, reason: 'User not found' };
    }

    const { planLimits } = userPlan;
    const currentUsage = await getUserUsage(userId);
    const limit = planLimits.document_analyses_per_month;

    // Unlimited plan
    if (limit === -1) {
      return { allowed: true, currentUsage, limit: 'unlimited' };
    }

    // Check if user has exceeded their limit
    if (currentUsage >= limit) {
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
      sql: `INSERT INTO api_usage (
        endpoint_id,
        timestamp,
        status_code,
        response_time_ms,
        request_size_bytes,
        response_size_bytes,
        ip_address,
        user_agent
      ) VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?)`,
      args: [
        endpointId,
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

// Validate plan type
export function isValidPlanType(planType: string): planType is PlanType {
  return planType in PLAN_CONFIGS;
}

// Get plan features
export function getPlanFeatures(planType: PlanType) {
  return PLAN_CONFIGS[planType].features;
}

// Get plan limits
export function getPlanLimits(planType: PlanType) {
  return PLAN_CONFIGS[planType].document_analyses_per_month;
} 