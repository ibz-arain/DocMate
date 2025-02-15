import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const RequestSchema = z.object({
  imageData: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData } = RequestSchema.parse(body);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
            "date": "",
            "description": "",
            "amount": "",
            "type": "credit|debit",
            "category": "",
            "runningBalance": ""
          }
        ]
      },
      "analysis": {
        "summary": "Brief summary of account activity and notable patterns",
        "keywords": ["relevant", "keywords"],
        "insights": [
          "Spending patterns",
          "Large transactions",
          "Regular payments"
        ],
        "confidenceScore": 0.0
      }
    }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
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

    return NextResponse.json({ 
      success: true,
      analysis: parsedData 
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