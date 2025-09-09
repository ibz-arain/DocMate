import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, getTokenFromRequest, sanitizeUser } from '@/lib/auth-utils';
import { User, UpdatePlanRequest } from '@/types/auth';
import { DEFAULT_PLANS, isValidPlanType, getPlanInfo } from '@/lib/plan-utils';

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
    const planConfig = getPlanInfo(plan_type);
    
    if (!planConfig) {
      return NextResponse.json(
        { message: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Update user plan
    const result = await db.execute({
      sql: `UPDATE users 
            SET plan_type = ?, plan_limits = ?, updated_at = CURRENT_DATE 
            WHERE user_id = ? 
            RETURNING user_id, first_name, last_name, email, phone_number, 
                     is_active, plan_type, plan_limits,
                     created_at, updated_at`,
      args: [plan_type, plan_limits || null, payload.userId]
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
      message: `Plan updated to ${planConfig.plan_type} successfully`
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
    
    // Handle null plan_type by using default config
    const planType = userPlan.plan_type || 'free';
    const planLimits = userPlan.plan_limits;
    const planConfig = getPlanInfo(planType);
    
    if (!planConfig) {
      return NextResponse.json(
        { message: 'Invalid plan configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      plan_type: planType,
      plan_limits: planLimits,
      plan_info: planConfig
    });

  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching plan information' },
      { status: 500 }
    );
  }
} 