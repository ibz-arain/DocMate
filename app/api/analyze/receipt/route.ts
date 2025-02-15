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