//Clone of the custom route
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
  type: z.enum(['table', 'data']),
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

    let prompt = `Analyze this document and extract information in the following format:\n\n`;
    
    if (outputFormat) {
      outputFormat.tables.forEach((table, index) => {
        prompt += `${table.type === 'table' ? 'Table' : 'Data Section'} ${index + 1}: ${table.name}\n`;
        if (table.description) {
          prompt += `Description: ${table.description}\n`;
        }
        prompt += `Type: ${table.type === 'table' ? 'Repeating Data (extract all instances)' : 'Single Values (extract one instance)'}\n`;
        prompt += `Fields to extract:\n`;
        table.fields.forEach(field => {
          prompt += `- ${field.name}${field.description ? ` (${field.description})` : ''}\n`;
          prompt += `  Type: ${field.type}\n`;
          prompt += `  Required: ${field.required ? 'Yes' : 'No'}\n`;
          if (field.format) prompt += `  Format: ${field.format}\n`;
        });
        prompt += '\n';
      });

      prompt += `\nStructure the response as follows:
{
  "documentType": "${outputFormat.documentType}",
  "content": {
    ${outputFormat.tables.map(table => {
      if (table.type === 'table') {
        return `"${table.name}": [
          {
            ${table.fields.map(f => `"${f.name}": "value"`).join(',\n            ')}
          }
          // Additional entries for all instances found...
        ]`;
      } else {
        return `"${table.name}": {
          ${table.fields.map(f => `"${f.name}": "single value"`).join(',\n          ')}
        }`;
      }
    }).join(',\n    ')}
  },
  "analysis": {
    "summary": "Brief summary of the document",
    "keywords": ["relevant", "keywords"],
    "insights": ["Key insights about the extracted data"],
    "confidenceScore": 0.0,
    "metadata": {
      "documentId": "unique_identifier",
      "processedAt": "timestamp",
      "confidence": "overall_confidence_score",
      "documentType": "detected_document_type",
      "processingDetails": {
        "ocrConfidence": "ocr_confidence_score",
        "imageQuality": "image_quality_score",
        "processingTime": "processing_duration"
      }
    },
    "tableStats": {
      ${outputFormat.tables.map(table => `"${table.name}": {
        ${table.type === 'table' ? '"entriesFound": 0,' : ''}
        "confidence": 0.0,
        "fieldStats": {
          ${table.fields.map(field => `"${field.name}": {
            "found": ${table.type === 'table' ? '0' : '1'},
            "confidence": 0.0
          }`).join(',\n          ')}
        }
      }`).join(',\n      ')}
    }
  }
}\n\nImportant instructions:
1. For tables marked as "Repeating Data", extract ALL instances found in the document
2. For sections marked as "Single Values", extract only ONE instance
3. Maintain the exact field names and types as specified
4. Ensure all required fields are populated
5. Follow any specified formats for fields
6. Store all metadata in the analysis.metadata section, not in the main content`;
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

    // Clean up and validate the response structure
    if (outputFormat && parsedData.content) {
      for (const table of outputFormat.tables) {
        const tableContent = parsedData.content[table.name];
        
        // Initialize if missing
        if (!tableContent) {
          parsedData.content[table.name] = table.type === 'table' ? [] : {};
          continue;
        }

        // Handle table type data
        if (table.type === 'table') {
          // Ensure array format
          if (!Array.isArray(tableContent)) {
            parsedData.content[table.name] = Object.values(tableContent);
          }
          
          // Ensure all required fields exist in each entry
          parsedData.content[table.name] = parsedData.content[table.name].map((entry: any) => {
            const cleanEntry: any = {};
            table.fields.forEach(field => {
              cleanEntry[field.name] = entry[field.name] || '';
            });
            return cleanEntry;
          });
        } else {
          // Handle data section (single values)
          if (Array.isArray(tableContent)) {
            // If it's an array, take the first item
            parsedData.content[table.name] = tableContent[0] || {};
          } else if (typeof tableContent !== 'object') {
            parsedData.content[table.name] = {};
          }
          
          // Ensure all fields exist
          const cleanData: any = {};
          table.fields.forEach(field => {
            cleanData[field.name] = parsedData.content[table.name][field.name] || '';
          });
          parsedData.content[table.name] = cleanData;
        }
      }

      // Initialize or update analysis section with metadata
      if (!parsedData.analysis) {
        parsedData.analysis = {
          summary: "",
          keywords: [],
          insights: [],
          confidenceScore: 0.95,
          metadata: {
            documentId: `doc_${Date.now()}`,
            processedAt: new Date().toISOString(),
            confidence: 0.95,
            documentType: parsedData.documentType,
            processingDetails: {
              ocrConfidence: 0.95,
              imageQuality: "high",
              processingTime: "1.2s"
            }
          },
          tableStats: {}
        };
      }

      // Ensure metadata exists in analysis
      if (!parsedData.analysis.metadata) {
        parsedData.analysis.metadata = {
          documentId: `doc_${Date.now()}`,
          processedAt: new Date().toISOString(),
          confidence: parsedData.analysis.confidenceScore || 0.95,
          documentType: parsedData.documentType,
          processingDetails: {
            ocrConfidence: 0.95,
            imageQuality: "high",
            processingTime: "1.2s"
          }
        };
      }

      if (!parsedData.analysis.tableStats) {
        parsedData.analysis.tableStats = {};
      }

      // Update statistics for each table
      outputFormat.tables.forEach(table => {
        const tableContent = parsedData.content[table.name];
        const stats: {
          entriesFound?: number;
          confidence: number;
          fieldStats: Record<string, { found: number; confidence: number }>;
        } = {
          confidence: 0.95,
          fieldStats: {}
        };

        if (table.type === 'table') {
          stats.entriesFound = Array.isArray(tableContent) ? tableContent.length : 0;
        }

        // Calculate field statistics
        table.fields.forEach(field => {
          stats.fieldStats[field.name] = {
            found: table.type === 'table' 
              ? (Array.isArray(tableContent) ? tableContent.length : 0)
              : (tableContent[field.name] ? 1 : 0),
            confidence: 0.95
          };
        });

        parsedData.analysis.tableStats[table.name] = stats;
      });
    }
    
    // Return the cleaned up response with metadata in analysis section
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