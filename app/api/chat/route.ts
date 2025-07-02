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

// Request schema for chat
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  context: z.object({
    type: z.enum(['full_document', 'text_selection', 'box_selection']),
    data: z.string(), // base64 encoded content
    mimeType: z.string(),
    documentName: z.string().optional(),
    selectedText: z.string().optional(),
  })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = ChatRequestSchema.parse(body);

    // Build context-aware prompt
    let systemPrompt = '';
    let userMessage = '';

    switch (context.type) {
      case 'full_document':
        systemPrompt = `You are a helpful AI assistant having a conversation about a document${context.documentName ? ` titled "${context.documentName}"` : ''}. 

Your role:
- Analyze the document content and answer questions about it
- Provide helpful, conversational responses
- Be friendly and informative
- Ask follow-up questions when appropriate
- Focus on understanding and explaining the document's content

Guidelines:
- Respond in a natural, conversational tone
- Be concise but thorough
- If you can't find specific information, say so honestly
- Offer to help with related questions`;

        userMessage = `Here's my question about the document: ${message}

Please provide a helpful response based on the document content.`;
        break;

      case 'text_selection':
        systemPrompt = `You are a helpful AI assistant having a conversation about a specific text selection from a document.

Your role:
- Focus specifically on the selected text: "${context.selectedText}"
- Answer questions about this text selection
- Provide analysis, explanations, or insights about the selected content
- Be conversational and helpful

Guidelines:
- Keep responses focused on the selected text
- Be natural and conversational
- Provide context when helpful
- Ask follow-up questions if appropriate`;

        userMessage = `I've selected this text: "${context.selectedText}"

My question: ${message}

Please help me with this selection.`;
        break;

      case 'box_selection':
        systemPrompt = `You are a helpful AI assistant having a conversation about a visual selection (image/chart/diagram) from a document.

Your role:
- Analyze the visual content in the selection
- Answer questions about charts, tables, images, or other visual elements
- Provide insights about the visual information
- Be conversational and helpful

Guidelines:
- Focus on the visual content
- Explain what you see in the image
- Provide analysis of charts, graphs, tables if present
- Be natural and conversational`;

        userMessage = `I've selected a visual area from the document. My question: ${message}

Please analyze the visual content and help me understand it.`;
        break;
    }

    // Prepare message content based on context type
    let messageContent: any[];
    
    if (context.type === 'text_selection') {
      // For text selections, we can include the text directly
      messageContent = [
        { type: 'text', text: `${systemPrompt}\n\n${userMessage}` }
      ];
    } else {
      // For documents and box selections, include the file/image
      messageContent = [
        { type: 'text', text: `${systemPrompt}\n\n${userMessage}` },
        { type: 'file', data: context.data, mimeType: context.mimeType }
      ];
    }

    // Generate response using AI
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [{
        role: 'user',
        content: messageContent
      }],
      maxTokens: 1000, // Reasonable limit for chat responses
      temperature: 0.7, // Slightly creative for conversational tone
    });

    // Return the conversational response
    return NextResponse.json({
      success: true,
      message: result.text.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
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