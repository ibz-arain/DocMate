import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { withRateLimit } from '@/lib/rate-limit-middleware';
import { getSummarizeInputDescription } from '@/lib/input-description-utils';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const RequestSchema = z.object({
  text: z.string().min(1)
});

async function summarizeHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = RequestSchema.parse(body);

    const prompt = `Analyze the following text and create an intelligent summary. Choose the best format based on the content - you can use bullet points, paragraphs, numbered lists, or mix different formats as appropriate. Focus on clarity and usefulness, as well as keep it as short as possible.

Text to summarize:
${text}

Instructions:
- Choose the most appropriate format(s) for this specific content
- Be concise but comprehensive
- Highlight the most important information
- Use clear, accessible language
- You can mix formats (e.g., a brief intro paragraph followed by bullet points)
- Focus on what would be most useful to the reader
- Do not include any markdown formatting or extra text
- Make it engaging and easy to read`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const summary = result.text.trim();

    return NextResponse.json({
      success: true,
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: Math.round((1 - summary.length / text.length) * 100),
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Summarization Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 

// Create a custom rate limit wrapper for summarize that provides specific input description
const withSummarizeRateLimit = (handler: (req: NextRequest) => Promise<NextResponse>) => {
  return async function(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    let response: NextResponse;
    let requestBody: any = null;
    
    try {
      // Import the necessary functions
      const { getUserFromRequest, checkRateLimit, recordApiUsage, getRequestSize, getResponseSize, getClientIP, getUserAgent } = await import('@/lib/usage-utils');
      
      // Get user from request
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
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
      
      // Generate specific input description for summarize
      let inputDescription = '';
      try {
        const clonedReq = req.clone();
        requestBody = await clonedReq.json();
        inputDescription = getSummarizeInputDescription(req, requestBody);
      } catch (error) {
        inputDescription = 'Summary request';
      }
      
      const usageRecord = {
        user_id: user.userId,
        endpoint_name: 'analyze',
        request_size_bytes: getRequestSize(req),
        response_size_bytes: getResponseSize(response),
        status_code: response.status,
        response_time_ms: responseTime,
        ip_address: getClientIP(req),
        user_agent: getUserAgent(req),
        input_description: inputDescription
      };
      
      // Record usage asynchronously
      recordApiUsage(usageRecord).catch(error => {
        console.error('Failed to record API usage:', error);
      });
      
      return response;
      
    } catch (error) {
      // Record usage even for failed requests
      const { getUserFromRequest, recordApiUsage, getRequestSize, getClientIP, getUserAgent } = await import('@/lib/usage-utils');
      const user = await getUserFromRequest(req);
      if (user) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let inputDescription = '';
        try {
          if (requestBody) {
            inputDescription = getSummarizeInputDescription(req, requestBody);
          }
        } catch (parseError) {
          inputDescription = 'Summary request';
        }
        
        const usageRecord = {
          user_id: user.userId,
          endpoint_name: 'analyze',
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

export const POST = withSummarizeRateLimit(summarizeHandler); 