import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, getTokenFromRequest, sanitizeUser } from '@/lib/auth-utils';
import { User, UpdatePlanRequest } from '@/types/auth';
import { PLAN_CONFIGS, isValidPlanType } from '@/lib/plan-utils';

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body: UpdatePlanRequest = await request.json();
    const { plan_type, plan_limits } = body;

    // Validate plan type
    if (!plan_type || !isValidPlanType(plan_type)) {
      return NextResponse.json(
        { message: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get plan configuration
    const planConfig = PLAN_CONFIGS[plan_type];
    
    // Prepare plan limits
    const limits = plan_limits ?? planConfig.document_analyses_per_month;

    // Update user plan
    const result = await db.execute({
      sql: `UPDATE users 
            SET plan_type = ?, plan_limits = ?, updated_at = CURRENT_DATE 
            WHERE user_id = ? 
            RETURNING user_id, first_name, last_name, email, phone_number, 
                     email_verified, phone_verified, is_active, plan_type, plan_limits, 
                     created_at, updated_at`,
      args: [plan_type, limits, payload.userId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0] as unknown as User;
    const publicUser = sanitizeUser(user);

    return NextResponse.json({
      user: publicUser,
      message: `Plan updated to ${planConfig.name} successfully`
    });

  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the plan' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current plan information
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user's current plan
    const result = await db.execute({
      sql: `SELECT plan_type, plan_limits 
            FROM users WHERE user_id = ? AND is_active = 1`,
      args: [payload.userId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const userPlan = result.rows[0] as any;
    const planType = (userPlan.plan_type || 'free') as keyof typeof PLAN_CONFIGS;
    const planConfig = PLAN_CONFIGS[planType];
    
    // Handle null plan_limits by using default config
    const planLimits = userPlan.plan_limits ?? planConfig.document_analyses_per_month;

    return NextResponse.json({
      current_plan: planType,
      plan_config: planConfig,
      plan_limits: {
        document_analyses_per_month: planLimits,
        features: planConfig.features
      },
      available_plans: PLAN_CONFIGS
    });

  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching plan information' },
      { status: 500 }
    );
  }
} 