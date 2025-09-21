import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';
import { withRateLimit } from '@/lib/rate-limit-middleware';
import { getChatInputDescription } from '@/lib/input-description-utils';

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
    type: z.enum(['full_document', 'text_selection', 'box_selection', 'mixed_selection']),
    data: z.string(), // base64 encoded content
    mimeType: z.string(),
    documentName: z.string().optional(),
    selectedText: z.string().optional(),
    // New field for multiple selections
    selections: z.array(z.object({
      type: z.enum(['text', 'image']),
      data: z.string(),
      mimeType: z.string().optional(),
    })).optional(),
  })
});

async function chatHandler(req: NextRequest) {
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
        const hasCurrentSelections = context.selections && context.selections.length > 0;
        const textContent = hasCurrentSelections 
          ? `the ${context.selections!.length} text selection${context.selections!.length > 1 ? 's' : ''} provided with this message`
          : `a specific text selection from a document: "${context.selectedText}"`;
        
        systemPrompt = `You are a helpful AI assistant having a natural conversation about ${textContent}.

Your role:
- Focus on the text content provided with the current message
- Respond naturally as if you're discussing documents with a colleague
- Provide insights, analysis, or explanations in a conversational way
- Remember previous conversation context when it's relevant

Guidelines:
- Respond naturally and conversationally, not formally or structured
- Don't explicitly call out "Selection 1", "Selection 2" etc. - just discuss the content
- Integrate insights from multiple texts seamlessly in your response
- Use natural language like "both texts mention..." or "I notice these passages..."
- Be helpful and engaging without being overly analytical or structured`;
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

      case 'mixed_selection':
        const selectionCount = context.selections ? context.selections.length : 0;
        systemPrompt = `You are a helpful AI assistant having a natural conversation about ${selectionCount} pieces of content provided with the current message, which may include both text passages and visual elements.

Your role:
- Discuss the content provided with the current message naturally
- Respond as if you're having a conversation with a colleague about documents
- Connect insights between different pieces of content in a natural way
- Remember previous conversation context when it's relevant

Guidelines:
- Respond naturally and conversationally, not formally or structured
- Don't explicitly label content as "Selection 1", "Selection 2" etc.
- Weave insights from multiple pieces together naturally
- Use conversational language like "these passages show..." or "looking at this content..."
- Be helpful and engaging without being overly analytical or formal
- Focus on what the user is asking about the content`;
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
          } else if (context.type === 'mixed_selection' && context.selections) {
            // For mixed selections, include all selections with the user message
            messageContent = [
              { type: 'text', text: `${msg.content}\n\nHere's the content I'm referring to:` }
            ];
            
            // Add all selections naturally
            for (let i = 0; i < context.selections.length; i++) {
              const selection = context.selections[i];
              if (selection.type === 'text') {
                messageContent.push({ 
                  type: 'text', 
                  text: `${selection.data}` 
                });
              } else if (selection.type === 'image') {
                messageContent.push({ 
                  type: 'file', 
                  data: selection.data, 
                  mimeType: selection.mimeType || 'image/png' 
                });
              }
            }
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
    let messageContent: any[];
    
    // Always check for selections first, regardless of documentContentIncluded
    if (context.selections && context.selections.length > 0) {
      // Include all selections with the current user message
      messageContent = [
        { type: 'text', text: `${message}\n\nHere's the content I'm referring to:` }
      ];
      
      // Add all selections naturally
      for (let i = 0; i < context.selections.length; i++) {
        const selection = context.selections[i];
        if (selection.type === 'text') {
          messageContent.push({ 
            type: 'text', 
            text: `${selection.data}` 
          });
        } else if (selection.type === 'image') {
          messageContent.push({ 
            type: 'file', 
            data: selection.data, 
            mimeType: selection.mimeType || 'image/png' 
          });
        }
      }
    } else if (!documentContentIncluded) {
      // Fall back to legacy context handling for first message only
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
    } else {
      // Just add the text for subsequent messages with no selections
      messageContent = [
        { type: 'text', text: message }
      ];
    }
    
    conversationMessages.push({
      role: 'user',
      content: messageContent
    });

    // Generate response using AI with full conversation context
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      messages: conversationMessages,
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

    // Handle specific AI SDK errors
    if (error && typeof error === 'object' && 'cause' in error) {
      const cause = (error as any).cause;
      if (cause && typeof cause === 'object' && 'issues' in cause) {
        // This is likely a validation error from the AI SDK
        console.error('AI SDK validation error:', cause.issues);
        return NextResponse.json(
          { 
            success: false, 
            error: 'AI response validation failed. Please try again with a shorter message or different content.',
            details: cause.issues
          },
          { status: 500 }
        );
      }
    }

    // Handle MAX_TOKENS or incomplete responses
    if (error instanceof Error && error.message.includes('MAX_TOKENS')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Response was too long. Please try with a shorter message or break your request into smaller parts.'
        },
        { status: 500 }
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

export const POST = withRateLimit({ endpointName: 'chat', requireAuth: true })(chatHandler); 