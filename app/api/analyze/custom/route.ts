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

const FieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  format: z.string().optional()
});

const TableSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(FieldSchema)
});

const RequestSchema = z.object({
  imageData: z.string(),
  mimeType: z.string().optional(),
  customPrompt: z.string(),
  outputFormat: z.object({
    documentType: z.string(),
    tables: z.array(TableSchema)
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, mimeType = 'image/jpeg', customPrompt, outputFormat } = RequestSchema.parse(body);

    const isPDF = imageData.startsWith('data:application/pdf') || mimeType === 'application/pdf';
    const fileType = isPDF ? 'application/pdf' : 'image/jpeg';

    let prompt = `Analyze this document and extract ALL instances of the following information, organized into tables. For each table, extract all relevant data entries. Return the data in a structured format.\n\n`;
    
    if (outputFormat) {
      outputFormat.tables.forEach((table, index) => {
        prompt += `Table ${index + 1}: ${table.name}\n`;
        if (table.description) {
          prompt += `Description: ${table.description}\n`;
        }
        prompt += `Fields to extract:\n`;
        table.fields.forEach(field => {
          prompt += `- ${field.name}: ${field.description || 'Find all instances'}\n`;
          prompt += `  Type: ${field.type}\n`;
          prompt += `  Required: ${field.required ? 'Yes' : 'No'}\n`;
          if (field.format) prompt += `  Format: ${field.format}\n`;
        });
        prompt += '\n';
      });

      prompt += `\nStructure the response as follows:
{
  "documentType": "${outputFormat.documentType}",
  "metadata": {
    "documentId": "unique_identifier",
    "processedAt": "timestamp",
    "confidence": "overall_confidence_score"
  },
  "content": {
    ${outputFormat.tables.map(table => `"${table.name}": [
      { ${table.fields.map(f => `"${f.name}": "value"`).join(', ')} },
      { ${table.fields.map(f => `"${f.name}": "value"`).join(', ')} }
      // Additional entries as needed...
    ]`).join(',\n    ')}
  },
  "analysis": {
    "summary": "Brief summary of the document",
    "keywords": ["relevant", "keywords"],
    "insights": ["Key insights about the extracted data"],
    "confidenceScore": 0.0,
    "tableStats": {
      ${outputFormat.tables.map(table => `"${table.name}": {
        "entriesFound": 0,
        "confidence": 0.0,
        "fieldStats": {
          ${table.fields.map(field => `"${field.name}": { "found": 0, "confidence": 0.0 }`).join(',\n          ')}
        }
      }`).join(',\n      ')}
    }
  }
}`;
    }

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

    // Clean up the response structure
    if (outputFormat && parsedData.content) {
      for (const table of outputFormat.tables) {
        if (!parsedData.content[table.name]) {
          parsedData.content[table.name] = [];
        }
        
        // Convert object with entries to array if needed
        if (!Array.isArray(parsedData.content[table.name])) {
          const entries = parsedData.content[table.name];
          parsedData.content[table.name] = Object.values(entries);
        }
        
        // Update table statistics
        if (parsedData.analysis?.tableStats) {
          const tableContent = parsedData.content[table.name];
          const entryCount = tableContent.length;
          
          parsedData.analysis.tableStats[table.name] = {
            entriesFound: entryCount,
            confidence: 0.95,
            fieldStats: {}
          };

          // Calculate field statistics
          for (const field of table.fields) {
            parsedData.analysis.tableStats[table.name].fieldStats[field.name] = {
              found: entryCount,
              confidence: 0.95
            };
          }
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      analysis: parsedData,
      result: {
        documentType: parsedData.documentType,
        content: parsedData.content
      }
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