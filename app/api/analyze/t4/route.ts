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

    const prompt = `Analyze this T4 tax slip and extract the following information in a structured format:
    1. Extract all box numbers and their corresponding values
    2. Identify employee information (name, address, SIN)
    3. Identify employer information (name, address, account number)
    4. Extract the tax year
    
    Return the data in the following JSON format:
    {
      "documentType": "T4 Tax Slip",
      "metadata": {
        "year": "YYYY",
        "employer": {
          "name": "",
          "address": "",
          "accountNumber": ""
        },
        "employee": {
          "name": "",
          "address": "",
          "sin": ""
        }
      },
      "content": {
        "boxes": [
          { "boxNumber": "", "description": "", "amount": "" }
        ]
      },
      "analysis": {
        "summary": "Brief summary of the key financial information",
        "keywords": ["relevant", "keywords"],
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