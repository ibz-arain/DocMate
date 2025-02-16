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

    const prompt = `Analyze this store receipt and extract the following information in a structured format:
    1. Store/merchant information
    2. Transaction details (date, time, receipt number)
    3. All purchased items with quantities, unit prices, and totals
    4. Payment information and breakdown
    5. Any special offers, discounts, or loyalty points
    
    Return the data in the following JSON format:
    {
      "documentType": "Store Receipt",
      "metadata": {
        "merchant": {
          "name": "",
          "address": "",
          "phone": "",
          "taxId": ""
        },
        "transaction": {
          "date": "",
          "time": "",
          "receiptNumber": "",
          "cashier": ""
        }
      },
      "content": {
        "items": [
          {
            "name": "",
            "quantity": 0,
            "unitPrice": "",
            "totalPrice": "",
            "category": "",
            "discounts": [""]
          }
        ],
        "totals": {
          "subtotal": "",
          "tax": {
            "rate": "",
            "amount": ""
          },
          "discounts": [
            {
              "description": "",
              "amount": ""
            }
          ],
          "total": "",
          "payment": {
            "method": "",
            "amount": "",
            "change": ""
          }
        },
        "loyalty": {
          "programName": "",
          "pointsEarned": "",
          "balance": ""
        }
      },
      "analysis": {
        "summary": "Brief summary of the purchase",
        "keywords": ["relevant", "keywords"],
        "categories": ["item categories"],
        "insights": [
          "Spending patterns",
          "Savings achieved",
          "Notable items"
        ],
        "confidenceScore": 0.0
      }
    }`;

    const result = await generateText({
      model: google('gemini-1.5-pro'),
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