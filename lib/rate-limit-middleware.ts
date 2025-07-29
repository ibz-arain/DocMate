import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, checkRateLimit, recordApiUsage, getRequestSize, getResponseSize, getClientIP, getUserAgent, UsageRecord } from './usage-utils';
import { getChatInputDescription, getSummarizeInputDescription, getChartsInputDescription, getCustomInputDescription } from './input-description-utils';

export interface RateLimitConfig {
  endpointName: string;
  requireAuth?: boolean;
}

/**
 * Middleware wrapper for rate limiting API endpoints
 */
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function(req: NextRequest): Promise<NextResponse> {
      const startTime = Date.now();
      let response: NextResponse;
      let requestBody: any = null;
      
      try {
        // Get user from request
        const user = await getUserFromRequest(req);
        
        if (config.requireAuth && !user) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        // If no user found and auth is not required, allow the request
        if (!user) {
          response = await handler(req);
          return response;
        }
        
        // Check rate limit
        const rateLimitCheck = await checkRateLimit(user.userId);
        
        if (!rateLimitCheck.allowed) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Rate limit exceeded',
              usage: rateLimitCheck.usage
            },
            { status: 429 }
          );
        }
        
        // Execute the handler
        response = await handler(req);
        
        // Record usage after successful execution
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Generate input description based on endpoint
        let inputDescription = '';
        try {
          // Clone the request to read the body
          const clonedReq = req.clone();
          requestBody = await clonedReq.json();
          
          switch (config.endpointName) {
            case 'chat':
              inputDescription = getChatInputDescription(req, requestBody);
              break;
            case 'analyze':
              // For analyze endpoints, we'll determine the specific type in the route handlers
              inputDescription = 'Analysis request';
              break;
            default:
              inputDescription = 'API request';
          }
        } catch (error) {
          inputDescription = 'Unable to parse request body';
        }
        
        const usageRecord: UsageRecord = {
          user_id: user.userId,
          endpoint_name: config.endpointName,
          request_size_bytes: getRequestSize(req),
          response_size_bytes: getResponseSize(response),
          status_code: response.status,
          response_time_ms: responseTime,
          ip_address: getClientIP(req),
          user_agent: getUserAgent(req),
          input_description: inputDescription
        };
        
        // Record usage asynchronously (don't wait for it)
        recordApiUsage(usageRecord).catch(error => {
          console.error('Failed to record API usage:', error);
        });
        
        return response;
        
      } catch (error) {
        // Record usage even for failed requests
        const user = await getUserFromRequest(req);
        if (user) {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          let inputDescription = '';
          try {
            if (requestBody) {
              switch (config.endpointName) {
                case 'chat':
                  inputDescription = getChatInputDescription(req, requestBody);
                  break;
                case 'analyze':
                  inputDescription = 'Analysis request';
                  break;
                default:
                  inputDescription = 'API request';
              }
            }
          } catch (parseError) {
            inputDescription = 'Unable to parse request body';
          }
          
          const usageRecord: UsageRecord = {
            user_id: user.userId,
            endpoint_name: config.endpointName,
            request_size_bytes: getRequestSize(req),
            status_code: 500,
            response_time_ms: responseTime,
            ip_address: getClientIP(req),
            user_agent: getUserAgent(req),
            input_description: inputDescription
          };
          
          recordApiUsage(usageRecord).catch(error => {
            console.error('Failed to record API usage:', error);
          });
        }
        
        throw error;
      }
    };
  };
} 