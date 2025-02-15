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

    const prompt = `Analyze this dental claim form and extract the following information in a structured format:
    1. Patient and subscriber information
    2. Insurance policy details
    3. Dental provider information
    4. Treatment details and procedures
    5. Claim amounts and payment details
    
    Return the data in the following JSON format:
    {
      "documentType": "Dental Claim Form",
      "metadata": {
        "formInfo": {
          "formType": "",
          "formNumber": "",
          "submissionDate": ""
        },
        "insurance": {
          "company": "",
          "planNumber": "",
          "groupNumber": "",
          "employerName": ""
        },
        "provider": {
          "name": "",
          "address": "",
          "phone": "",
          "licenseNumber": "",
          "npi": "",
          "taxId": ""
        }
      },
      "content": {
        "patient": {
          "name": "",
          "dateOfBirth": "",
          "relationship": "",
          "address": "",
          "id": ""
        },
        "subscriber": {
          "name": "",
          "id": "",
          "dateOfBirth": "",
          "address": "",
          "employer": ""
        },
        "procedures": [
          {
            "date": "",
            "toothNumber": "",
            "surface": "",
            "procedureCode": "",
            "description": "",
            "fee": "",
            "status": "completed|planned"
          }
        ],
        "charges": {
          "totalFee": "",
          "insurance": {
            "deductible": "",
            "coverage": "",
            "pays": ""
          },
          "patient": {
            "paid": "",
            "balance": ""
          }
        }
      },
      "analysis": {
        "summary": "Brief summary of the dental claim",
        "keywords": ["relevant", "keywords"],
        "procedures": ["list of procedures"],
        "insights": [
          "Coverage details",
          "Payment responsibilities",
          "Treatment patterns"
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