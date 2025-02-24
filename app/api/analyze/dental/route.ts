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