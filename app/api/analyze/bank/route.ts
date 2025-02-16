import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

// Set a timeout for the AI operation
const AI_TIMEOUT = 240000; // 4 minutes

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

export const runtime = 'edge'; // Use Edge Runtime for better performance
export const maxDuration = 300; // 5 minutes maximum duration

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, mimeType = 'image/jpeg' } = RequestSchema.parse(body);

    const isPDF = imageData.startsWith('data:application/pdf') || mimeType === 'application/pdf';
    const fileType = isPDF ? 'application/pdf' : 'image/jpeg';

    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Analysis timeout - operation took too long'));
      }, AI_TIMEOUT);
    });

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

    // Create the AI analysis promise
    const analysisPromise = generateText({
      model: google('gemini-1.5-pro'),
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'file', data: imageData, mimeType: fileType }
        ]
      }]
    });

    // Race between the timeout and the analysis
    const result = await Promise.race([analysisPromise, timeoutPromise]) as any;

    const text = result.text;
    const cleanText = text.replace(/```json|```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse AI response', 
          details: error instanceof Error ? error.message : 'Unknown parsing error',
          rawText: text 
        },
        { status: 422 }
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
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Analysis timeout - please try again',
            details: error.message
          },
          { status: 504 }
        );
      }
      
      if (error.message.includes('parse')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid request format',
            details: error.message
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred during analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 