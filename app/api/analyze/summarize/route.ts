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
  text: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = RequestSchema.parse(body);

    const prompt = `Analyze the following text and create an intelligent summary. Choose the best format based on the content - you can use bullet points, paragraphs, numbered lists, or mix different formats as appropriate. Focus on clarity and usefulness, as well as keep it as short as possible.

Text to summarize:
${text}

Instructions:
- Choose the most appropriate format(s) for this specific content
- Be concise but comprehensive
- Highlight the most important information
- Use clear, accessible language
- You can mix formats (e.g., a brief intro paragraph followed by bullet points)
- Focus on what would be most useful to the reader
- Do not include any markdown formatting or extra text
- Make it engaging and easy to read`;

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const summary = result.text.trim();

    return NextResponse.json({
      success: true,
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: Math.round((1 - summary.length / text.length) * 100),
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Summarization Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 