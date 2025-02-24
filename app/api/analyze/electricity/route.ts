import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const RequestSchema = z.object({
  imageData: z.string(),
  mimeType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, mimeType = 'image/jpeg' } = RequestSchema.parse(body);

    // Determine if the data is a PDF or image based on the base64 header or mimeType
    const isPDF = imageData.startsWith('data:application/pdf') || mimeType === 'application/pdf';
    const fileType = isPDF ? 'application/pdf' : 'image/jpeg';

    const prompt = `Analyze this electricity bill and extract the following information in a structured format:
    1. Utility provider and customer information
    2. Billing period and important dates
    3. Meter readings and consumption details
    4. Rate calculations and charges breakdown
    5. Payment information and history
    
    Return the data in the following JSON format:
    {
      "documentType": "Electricity Bill",
      "metadata": {
        "utility": {
          "name": "",
          "address": "",
          "phone": "",
          "website": "",
          "emergencyContact": ""
        },
        "customer": {
          "name": "",
          "accountNumber": "",
          "meterNumber": "",
          "serviceAddress": "",
          "rateClass": ""
        },
        "billing": {
          "billNumber": "",
          "issueDate": "",
          "dueDate": "",
          "billingPeriod": {
            "from": "",
            "to": ""
          }
        }
      },
      "content": {
        "meterReadings": {
          "current": {
            "date": "",
            "reading": "",
            "type": "actual|estimated"
          },
          "previous": {
            "date": "",
            "reading": "",
            "type": "actual|estimated"
          }
        },
        "consumption": {
          "totalKWh": "",
          "averageDailyKWh": "",
          "peakUsage": "",
          "comparison": {
            "lastMonth": {
              "difference": "",
              "percentage": ""
            },
            "lastYear": {
              "difference": "",
              "percentage": ""
            }
          }
        },
        "charges": {
          "electricity": {
            "rate": "",
            "amount": ""
          },
          "delivery": {
            "description": "",
            "amount": ""
          },
          "regulatory": {
            "description": "",
            "amount": ""
          },
          "taxes": [
            {
              "description": "",
              "rate": "",
              "amount": ""
            }
          ],
          "adjustments": [
            {
              "description": "",
              "amount": ""
            }
          ],
          "total": {
            "currentCharges": "",
            "previousBalance": "",
            "payments": "",
            "amountDue": ""
          }
        }
      },
      "analysis": {
        "summary": "Brief summary of the bill and usage patterns",
        "keywords": ["relevant", "keywords"],
        "insights": [
          "Usage patterns",
          "Cost drivers",
          "Saving opportunities"
        ],
        "alerts": [
          "Notable changes",
          "Important notices"
        ],
        "confidenceScore": 0.0
      }
    }`;

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'file', data: imageData, mimeType: fileType }
        ]
      }]
    });

    const text = result.text;
    const cleanText = text.replace(/```json|```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response as JSON', rawText: text },
        { status: 500 }
      );
    }

    // Separate content from analysis data
    const { analysis, ...contentData } = parsedData;
    
    return NextResponse.json({ 
      success: true,
      analysis: parsedData,  // Full data for internal use
      result: contentData    // Only content data for display
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 