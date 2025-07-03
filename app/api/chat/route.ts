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

// Message schema for conversation history
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'context']),
  content: z.string(),
  timestamp: z.string().optional(),
});

// Request schema for chat
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  messages: z.array(MessageSchema).optional(), // Previous conversation history
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
    const { message, messages = [], context } = ChatRequestSchema.parse(body);

    // Build context-aware system prompt
    let systemPrompt = '';

    switch (context.type) {
      case 'full_document':
        systemPrompt = `You are a helpful AI assistant having a conversation about a document${context.documentName ? ` titled "${context.documentName}"` : ''}. 

Your role:
- Analyze the document content and answer questions about it
- Provide helpful, conversational responses
- Remember and reference previous parts of our conversation
- Be friendly and informative
- Ask follow-up questions when appropriate
- Focus on understanding and explaining the document's content

Guidelines:
- Respond in a natural, conversational tone
- Be concise but thorough
- If you can't find specific information, say so honestly
- Reference previous conversation when relevant
- Offer to help with related questions`;
        break;

      case 'text_selection':
        systemPrompt = `You are a helpful AI assistant having a conversation about a specific text selection from a document.

Your role:
- Focus specifically on the selected text: "${context.selectedText}"
- Answer questions about this text selection
- Remember and reference previous parts of our conversation
- Provide analysis, explanations, or insights about the selected content
- Be conversational and helpful

Guidelines:
- Keep responses focused on the selected text
- Be natural and conversational
- Reference previous conversation when relevant
- Provide context when helpful
- Ask follow-up questions if appropriate`;
        break;

      case 'box_selection':
        systemPrompt = `You are a helpful AI assistant having a conversation about a visual selection (image/chart/diagram) from a document.

Your role:
- Analyze the visual content in the selection
- Answer questions about charts, tables, images, or other visual elements
- Remember and reference previous parts of our conversation
- Provide insights about the visual information
- Be conversational and helpful

Guidelines:
- Focus on the visual content
- Explain what you see in the image
- Reference previous conversation when relevant
- Provide analysis of charts, graphs, tables if present
- Be natural and conversational`;
        break;
    }

    // Build conversation history for the AI model
    const conversationMessages: any[] = [];

    // Add system message
    conversationMessages.push({
      role: 'system',
      content: systemPrompt
    });

    // Process conversation history
    let documentContentIncluded = false;
    
    for (const msg of messages) {
      if (msg.role === 'context') {
        // Skip context messages in the conversation flow - they're just UI indicators
        continue;
      }
      
      if (msg.role === 'user' || msg.role === 'assistant') {
        // For the first user message, include document context
        if (msg.role === 'user' && !documentContentIncluded) {
          let messageContent: any[];
          
          if (context.type === 'text_selection') {
            // For text selections, include the text directly in the message
            messageContent = [
              { type: 'text', text: msg.content }
            ];
          } else {
            // For documents and box selections, include the file/image with the first user message
            messageContent = [
              { type: 'text', text: msg.content },
              { type: 'file', data: context.data, mimeType: context.mimeType }
            ];
          }
          
          conversationMessages.push({
            role: 'user',
            content: messageContent
          });
          documentContentIncluded = true;
        } else {
          // For subsequent messages, just include the text
          conversationMessages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
    }

    // Add the current user message
    if (!documentContentIncluded) {
      // If this is the first message in the conversation, include document context
      let messageContent: any[];
      
      if (context.type === 'text_selection') {
        messageContent = [
          { type: 'text', text: message }
        ];
      } else {
        messageContent = [
          { type: 'text', text: message },
          { type: 'file', data: context.data, mimeType: context.mimeType }
        ];
      }
      
      conversationMessages.push({
        role: 'user',
        content: messageContent
      });
    } else {
      // Just add the text for subsequent messages
      conversationMessages.push({
        role: 'user',
        content: message
      });
    }

    // Generate response using AI with full conversation context
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: conversationMessages,
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