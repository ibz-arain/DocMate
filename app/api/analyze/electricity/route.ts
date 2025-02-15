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