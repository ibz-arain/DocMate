import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

// Simplified request schema - only requires the file data
const RequestSchema = z.object({
  fileData: z.string(),
});

interface EndpointData {
  auth_enabled: boolean;
  rate_limit_enabled: boolean;
  rate_limit_requests: number;
  current_period_usage: string;
  template_tables: string;
  template_name: string;
}

interface EndpointRow {
  auth_enabled: boolean | null;
  rate_limit_enabled: boolean | null;
  rate_limit_requests: number | null;
  rate_limit_period: string | null;
  template_tables: string | null;
  template_name: string | null;
}

interface UsageRow {
  count: number;
}

async function validateApiKey(apiKey: string, endpointId: string): Promise<{ isValid: boolean; error?: string; endpointData?: EndpointData }> {
  try {
    const endpoint = await db.execute({
      sql: `
        SELECT 
          e.*,
          t.tables as template_tables,
          t.name as template_name
        FROM api_endpoints e
        LEFT JOIN templates t ON e.template_id = t.id
        WHERE e.id = ? AND e.api_key = ? AND e.status = 'active'
      `,
      args: [endpointId, apiKey],
    });

    if (!endpoint.rows.length) {
      return { isValid: false, error: 'Invalid API key or endpoint' };
    }

    const endpointRow = endpoint.rows[0] as unknown as EndpointRow;

    // Check if authentication is enabled
    if (endpointRow.auth_enabled && !apiKey) {
      return { isValid: false, error: 'Authentication required' };
    }

    // Check rate limiting if enabled
    if (endpointRow.rate_limit_enabled) {
      const period = endpointRow.rate_limit_period || 'minute';
      const timeUnit = period === 'second' ? 'seconds' : period === 'minute' ? 'minutes' : period === 'hour' ? 'hours' : 'days';
      
      const usage = await db.execute({
        sql: `
          SELECT COUNT(*) as count
          FROM api_usage
          WHERE endpoint_id = ?
          AND timestamp > datetime('now', '-1 ' || ? || '')
        `,
        args: [endpointId, timeUnit],
      });

      const usageRow = usage.rows[0] as unknown as UsageRow;
      const currentUsage = usageRow?.count || 0;
      const maxRequests = endpointRow.rate_limit_requests || 100;
      
      if (currentUsage >= maxRequests) {
        return { isValid: false, error: `Rate limit exceeded. Maximum ${maxRequests} requests per ${period} allowed` };
      }
    }

    if (!endpointRow.template_tables || !endpointRow.template_name) {
      return { isValid: false, error: 'No template configured for this endpoint' };
    }

    return { 
      isValid: true,
      endpointData: {
        auth_enabled: endpointRow.auth_enabled || false,
        rate_limit_enabled: endpointRow.rate_limit_enabled || false,
        rate_limit_requests: endpointRow.rate_limit_requests || 100,
        current_period_usage: '0',
        template_tables: endpointRow.template_tables,
        template_name: endpointRow.template_name
      }
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false, error: 'Internal server error' };
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const url = new URL(req.url);
  const endpointId = url.pathname.split('/').pop();
  
  try {
    // Validate endpoint ID
    if (!endpointId) {
      return NextResponse.json({ error: 'Invalid endpoint ID' }, { status: 400 });
    }

    // Get API key from Authorization header
    const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Validate API key and get endpoint data
    const validation = await validateApiKey(apiKey, endpointId);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { fileData } = RequestSchema.parse(body);

    // Auto-detect file type from base64 data
    const fileType = fileData.startsWith('data:application/pdf') ? 'application/pdf' : 
                    fileData.startsWith('data:image/') ? fileData.split(';')[0].split(':')[1] :
                    'image/jpeg'; // default to jpeg if can't detect

    // Parse the template tables from the endpoint data
    if (!validation.endpointData) {
      throw new Error("Endpoint data not found");
    }

    const templateTables = JSON.parse(validation.endpointData.template_tables);
    const outputFormat = {
      documentType: validation.endpointData.template_name,
      tables: templateTables
    };

    // Generate the prompt based on the template
    let prompt = `Analyze this document and extract information in the following format:\n\n`;
    
    templateTables.forEach((table: any, index: number) => {
      prompt += `${table.type === 'table' ? 'Table' : 'Data Section'} ${index + 1}: ${table.name}\n`;
      if (table.description) {
        prompt += `Description: ${table.description}\n`;
      }
      prompt += `Type: ${table.type === 'table' ? 'Repeating Data (extract all instances)' : 'Single Values (extract one instance)'}\n`;
      prompt += `Fields to extract:\n`;
      table.fields.forEach((field: any) => {
        prompt += `- ${field.name}${field.description ? ` (${field.description})` : ''}\n`;
        prompt += `  Type: ${field.type}\n`;
        prompt += `  Required: ${field.required ? 'Yes' : 'No'}\n`;
        if (field.format) prompt += `  Format: ${field.format}\n`;
      });
      prompt += '\n';
    });

    // Generate response using AI
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'file', data: fileData, mimeType: fileType }
        ]
      }]
    });

    // Process and validate the result
    const text = result.text;
    
    console.log('Original AI Response:', text);
    console.log('----------------------------------------');
    
    // First try to find JSON content between backticks if it exists
    let jsonContent = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/)?.[1] || text;
    
    console.log('Extracted JSON Content:', jsonContent);
    console.log('----------------------------------------');
    
    // Clean any non-JSON text before or after the main object
    jsonContent = jsonContent.replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1');
    
    // Remove any markdown or explanatory text
    jsonContent = jsonContent.replace(/```json|```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonContent);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response as valid JSON' },
        { status: 500 }
      );
    }

    interface Field {
      name: string;
      type: string;
      description?: string;
      required?: boolean;
      format?: string;
    }

    interface Table {
      name: string;
      type: 'table' | 'data';
      description?: string;
      fields: Field[];
    }

    interface DocumentContent {
      [key: string]: any;
    }

    interface DocumentStructure {
      documentType: string;
      content: DocumentContent;
    }

    // Validate the response matches the template structure
    const expectedStructure: DocumentStructure = {
      documentType: validation.endpointData.template_name,
      content: {}
    };

    // Initialize the content structure based on template
    templateTables.forEach((table: Table) => {
      if (table.type === 'table') {
        expectedStructure.content[table.name] = [];
      } else {
        expectedStructure.content[table.name] = {};
        table.fields.forEach((field: Field) => {
          expectedStructure.content[table.name][field.name] = '';
        });
      }
    });

    // Clean and validate the parsed data
    const cleanedData: DocumentStructure = {
      documentType: parsedData.documentType || validation.endpointData.template_name,
      content: {}
    };

    // Process each table in the template
    templateTables.forEach((table: Table) => {
      const tableData = parsedData.content?.[table.name];
      
      if (table.type === 'table') {
        // Ensure table data is an array
        cleanedData.content[table.name] = Array.isArray(tableData) ? tableData : [];
        
        // Clean each entry in the table
        cleanedData.content[table.name] = cleanedData.content[table.name].map((entry: any) => {
          const cleanEntry: Record<string, string> = {};
          table.fields.forEach((field: Field) => {
            cleanEntry[field.name] = entry[field.name] || '';
          });
          return cleanEntry;
        });
      } else {
        // Handle single value sections
        cleanedData.content[table.name] = {};
        table.fields.forEach((field: Field) => {
          cleanedData.content[table.name][field.name] = 
            tableData?.[field.name] || '';
        });
      }
    });

    // Record API usage
    await db.execute({
      sql: `
        INSERT INTO api_usage (
          endpoint_id,
          timestamp,
          status_code,
          response_time_ms,
          request_size_bytes,
          response_size_bytes,
          ip_address,
          user_agent
        ) VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?)
      `,
      args: [
        endpointId,
        200,
        Date.now() - startTime,
        Buffer.from(fileData).length,
        Buffer.from(JSON.stringify(cleanedData)).length,
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        req.headers.get('user-agent') || 'unknown'
      ],
    });

    return NextResponse.json({
      success: true,
      result: cleanedData
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Record failed API usage
    if (endpointId) {
      await db.execute({
        sql: `
          INSERT INTO api_usage (
            endpoint_id,
            timestamp,
            status_code,
            response_time_ms,
            ip_address,
            user_agent
          ) VALUES (?, datetime('now'), ?, ?, ?, ?)
        `,
        args: [
          endpointId,
          500,
          Date.now() - startTime,
          req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          req.headers.get('user-agent') || 'unknown'
        ],
      });
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