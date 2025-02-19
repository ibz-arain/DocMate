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

interface Transaction {
  date: string;
  description: string;
  amount: string;
  type: string;
}

interface BankAnalysis {
  documentType: string;
  metadata: {
    bank: {
      name: string;
      branchInfo: string;
    };
    account: {
      type: string;
      number: string;
      holder: string;
    };
    period: {
      startDate: string;
      endDate: string;
    };
  };
  content: {
    balances: {
      opening: string;
      closing: string;
      totalDeposits: string;
      totalWithdrawals: string;
    };
    transactions: Transaction[];
  };
  analysis: {
    summary: string;
    keywords: string[];
    insights: string[];
    confidenceScore: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, mimeType = 'image/jpeg' } = RequestSchema.parse(body);

    // Determine if the data is a PDF or image based on the base64 header or mimeType
    const isPDF = imageData.startsWith('data:application/pdf') || mimeType === 'application/pdf';
    const fileType = isPDF ? 'application/pdf' : 'image/jpeg';

    const prompt = `Analyze this bank statement and extract the following information in a structured format:
    1. Bank and account information
    2. Statement period and dates
    3. All transactions with dates, descriptions, and amounts
    4. Opening and closing balances
    5. Calculate total deposits and withdrawals
    
    Return the data in the following JSON format:
    {
      "documentType": "Bank Statement",
      "metadata": {
        "bank": {
          "name": "",
          "branchInfo": ""
        },
        "account": {
          "type": "",
          "number": "",
          "holder": ""
        },
        "period": {
          "startDate": "",
          "endDate": ""
        }
      },
      "content": {
        "balances": {
          "opening": "",
          "closing": "",
          "totalDeposits": "",
          "totalWithdrawals": ""
        },
        "transactions": [
          {
            "date": "MM/DD/YYYY",
            "description": "",
            "amount": "$0.00",
            "type": "credit|debit"
          }
        ]
      },
      "analysis": {
        "summary": "Brief summary of the statement",
        "keywords": ["relevant", "keywords"],
        "insights": [
          "Key financial insights",
          "Notable patterns",
          "Important changes"
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