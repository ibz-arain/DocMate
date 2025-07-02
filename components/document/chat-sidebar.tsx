"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageCircle, 
  Send, 
  Copy, 
  CheckCircle, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  RefreshCcw,
  Clock,
  Plus,
  X as XIcon,
  ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

const FormattedContent = ({ content }: { content: string }) => {
  const html = useMemo(() => {
    let html = content;

    // Code blocks  ```code```
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
      const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="rounded-md p-3 bg-primary/5 overflow-x-auto font-mono text-[13px]"><code class="text-primary/90">${escaped}</code></pre>`;
    });

    // Simple Markdown-style tables (must run early so subsequent replacements don't break the pipe chars)
    html = html.replace(/(?:^|\n)((?:[^\n|]*\|[^\n]*\n)+)/g, (match) => {
      const rows = match.trim().split('\n').map(r => r.trim()).filter(Boolean);
      if (rows.length < 2 || !rows[0].includes('|')) return match;
      const makeCells = (row: string, Tag: 'td' | 'th') =>
        row.trim().replace(/^\||\|$/g, '').split('|').map(cell => `<${Tag} class="border px-2 py-1">${cell.trim()}</${Tag}>`).join('');
      const headerRow = rows[0];
      let bodyStart = 1;
      if (/^([\s:-]*\|[\s:-]*)+$/.test(rows[1])) bodyStart = 2;
      const thead = `<thead><tr>${makeCells(headerRow, 'th')}</tr></thead>`;
      const tbodyRows = rows.slice(bodyStart).map(r => `<tr>${makeCells(r, 'td')}</tr>`).join('');
      return `\n<table class="border-collapse text-sm my-2">${thead}<tbody>${tbodyRows}</tbody></table>\n`;
    });

    // Bullet lists (-, *, •)  – must run before bold/italic replacement so leading * doesn't get interpreted as italic
    html = html.replace(/(?:^|\n)(?:[ \t]*[-*\u2022]\s+.+(?:\n[ \t]*[-*\u2022]\s+.+)*)/g, (block) => {
      const lines = block.trim().split(/\n+/).map(l => l.trim());
      if (lines.length === 0) return block;
      const items = lines
        .map(l => l.replace(/^[-*\u2022]\s+/, ''))
        .map(text => `<li class="mb-1">${text}</li>`)
        .join('');
      return `\n<ul class="list-disc list-inside my-2">${items}</ul>`;
    });

    // Numbered lists (1. item, 2. item)
    html = html.replace(/(?:^|\n)(?:[ \t]*\d+\.\s+.+(?:\n[ \t]*\d+\.\s+.+)*)/g, (block) => {
      const lines = block.trim().split(/\n+/).map(l => l.trim());
      if (lines.length === 0) return block;
      const items = lines
        .map(l => l.replace(/^\d+\.\s+/, ''))
        .map(text => `<li class="mb-1">${text}</li>`)
        .join('');
      return `\n<ol class="list-decimal list-inside my-2">${items}</ol>`;
    });

    // Blockquotes (> )
    html = html.replace(/^>\s?(.*)$/gm, '<blockquote class="border-l-2 border-primary pl-4 py-2 pr-3 my-3 bg-primary/5 rounded-r-lg italic text-primary/90">$1</blockquote>');

    // Horizontal rules (*** or ---)
    html = html.replace(/^[\s]*([-*]{3,})[\s]*$/gm, '<hr class="my-4 border-t border-border" />');

    // Bold, Italic, Inline code (now safe – list markers already converted)
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // italics only when *word* is on same line to avoid stray asterisks
      .replace(/\*(?!\s)([^\n*]+?)\*(?!\S)/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    // Line breaks for remaining newlines
    html = html.replace(/\n/g, '<br>');

    return html;
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'context';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  linesCount?: number; // Only for context messages
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  context: {
    selectedText?: string;
    selectionData?: any;
    documentName?: string;
    pageNumber?: number;
  };
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
  selectionData?: any;
  documentName?: string;
  currentPageNumber?: number;
  pdfFile?: File | null;
  onWidthChange?: (width: number) => void;
  /**
   * Optional text to pre-populate the chat input. This should not trigger
   * message sending – it merely lets the user review or edit before hitting
   * enter.
   */
  prefillInput?: string;
}

export function ChatSidebar({ 
  isOpen, 
  onClose, 
  selectedText = "", 
  selectionData,
  documentName,
  currentPageNumber,
  pdfFile,
  onWidthChange,
  prefillInput
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [sidebarWidth] = useState(400);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Track if we loaded a conversation from history to avoid double initialization
  const loadedFromHistoryRef = useRef(false);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Context snippets (text selections stacked before sending)
  interface Snippet {
    id: string;
    text: string;
    linesCount: number;
  }

  const [snippets, setSnippets] = useState<Snippet[]>([]);

  // Chat history management functions
  const saveChatHistory = (conversations: ChatConversation[]) => {
    try {
      localStorage.setItem('docmate-chat-history', JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const loadChatHistory = (): ChatConversation[] => {
    try {
      const stored = localStorage.getItem('docmate-chat-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    return [];
  };

  const saveCurrentConversation = () => {
    if (messages.length === 0) return;

    const firstUserMsg = messages.find(m => m.role === 'user')?.content;
    const conversationTitle = firstUserMsg ? (firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '')) : 'New Chat';
    
    const conversation: ChatConversation = {
      id: currentConversationId || `chat-${Date.now()}`,
      title: conversationTitle,
      messages: [...messages],
      context: {
        selectedText,
        selectionData,
        documentName,
        pageNumber: currentPageNumber,
      },
      timestamp: new Date()
    };

    const updatedHistory = chatHistory.filter(c => c.id !== conversation.id);
    updatedHistory.unshift(conversation); // Add to beginning
    
    // Keep only last 20 conversations
    const trimmedHistory = updatedHistory.slice(0, 20);
    
    setChatHistory(trimmedHistory);
    saveChatHistory(trimmedHistory);
    setCurrentConversationId(conversation.id);
  };

  const loadConversation = (conversation: ChatConversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    loadedFromHistoryRef.current = true;
  };

  const buildWelcomeMessage = (): ChatMessage => {
    return {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    };
  };

  const startNewConversation = () => {
    // Save current conversation if it has messages
    if (messages.length > 0) {
      saveCurrentConversation();
    }

    // Check if a placeholder 'New Chat' (no user messages) already exists
    const existingEmpty = chatHistory.find(c => c.title === 'New Chat' && c.messages.every(m => m.role !== 'user'));
    if (existingEmpty) {
      loadConversation(existingEmpty);
      return;
    }

    const newConversationId = `chat-${Date.now()}`;
    const welcomeMsg = buildWelcomeMessage();

    // Create and persist immediately
    const newConversation: ChatConversation = {
      id: newConversationId,
      title: 'New Chat',
      messages: [welcomeMsg],
      context: {
        selectedText,
        selectionData,
        documentName,
        pageNumber: currentPageNumber,
      },
      timestamp: new Date(),
    };

    const updatedHistory = [newConversation, ...chatHistory].slice(0, 20);
    setChatHistory(updatedHistory);
    saveChatHistory(updatedHistory);

    // Persist active id
    try {
      localStorage.setItem('docmate-active-chat-id', newConversationId);
    } catch {/* ignore */}

    setCurrentConversationId(newConversationId);
    setMessages([welcomeMsg]);
    setInputMessage('');
    setIsLoading(false);
    setCopiedMessageId(null);
    loadedFromHistoryRef.current = true; // Already loaded now
  };

  // Persist active conversation ID whenever it changes
  useEffect(() => {
    if (currentConversationId) {
      try {
        localStorage.setItem('docmate-active-chat-id', currentConversationId);
      } catch {
        /* ignore */
      }
    }
  }, [currentConversationId]);

  // Load chat history on component mount
  useEffect(() => {
    const history = loadChatHistory();
    setChatHistory(history);

    // Try to restore previously active conversation first
    let restored = false;
    try {
      const activeId = localStorage.getItem('docmate-active-chat-id');
      if (activeId) {
        const conv = history.find(c => c.id === activeId);
        if (conv) {
          setMessages(conv.messages);
          setCurrentConversationId(conv.id);
          loadedFromHistoryRef.current = true;
          restored = true;
        }
      }
    } catch {/* ignore */}

    // If not restored and there is history, attempt to match context or fall back to newest
    if (!restored && history.length > 0 && messages.length === 0) {
      const matchingConversation = history.find(c => {
        const ctx = c.context || {};
        return ctx.selectedText === selectedText && ctx.documentName === documentName;
      });

      const conversationToLoad = matchingConversation || history[0];

      if (conversationToLoad) {
        setMessages(conversationToLoad.messages);
        setCurrentConversationId(conversationToLoad.id);
        loadedFromHistoryRef.current = true;
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Initialize chat when sidebar opens (only if no history was loaded)
  useEffect(() => {
    if (isOpen && messages.length === 0 && !loadedFromHistoryRef.current) {
      // Build a welcome-only conversation but don't save to history here (will be saved when user starts chatting)
      const welcomeMsg = buildWelcomeMessage();
      setMessages([welcomeMsg]);
    }
  }, [isOpen, selectedText, messages.length]);

  // Notify parent of width changes
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isOpen ? sidebarWidth : 0);
    }
  }, [isOpen, sidebarWidth, onWidthChange]);

  // Function to estimate line numbers from selection
  const getLineNumbers = (text: string): { start: number; end: number } | null => {
    if (!text || text === '[Full Document]' || text === '[Box Selection]') return null;
    // Rough estimation - count newlines before selection in the full document
    const lines = text.split('\n');
    return {
      start: 1, // We'll need actual line numbers from PDF selection
      end: lines.length
    };
  };

  // Get a preview of the selected text
  const getSelectionPreview = (text: string): string => {
    if (!text || text === '[Full Document]' || text === '[Box Selection]') return '';
    const maxLength = 100;
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Effect: when a new text selection arrives via props, add to snippets list (avoid duplicates)
  useEffect(() => {
    if (
      isOpen &&
      selectedText &&
      selectedText !== '[Full Document]' &&
      selectedText !== '[Box Selection]'
    ) {
      setSnippets(prev => {
        if (prev.some(s => s.text === selectedText)) return prev;
        const newSnippet: Snippet = {
          id: `snip-${Date.now()}`,
          text: selectedText,
          linesCount: selectedText.split('\n').length,
        };
        return [...prev, newSnippet];
      });
    }
  }, [selectedText, isOpen]);

  // Remove snippet helper
  const removeSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Convert current snippets into context messages
    const contextMessages: ChatMessage[] = snippets.map((snip, idx) => ({
      id: `context-${Date.now()}-${idx}`,
      role: 'context',
      content: snip.text,
      timestamp: new Date(),
      linesCount: snip.linesCount,
    }));

    setMessages(prev => [...prev, ...contextMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Clear snippets after attaching them to the conversation
    setSnippets([]);

    try {
      const response = await sendChatMessage(inputMessage.trim());
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        // Save conversation after each exchange
        setTimeout(() => {
          const firstUserMsg = newMessages.find(m => m.role === 'user')?.content;
          const conversationTitle = firstUserMsg ? (firstUserMsg.slice(0,30) + (firstUserMsg.length>30 ? '...' : '')) : 'Conversation';
          
          const conversation: ChatConversation = {
            id: currentConversationId || `chat-${Date.now()}`,
            title: conversationTitle,
            messages: newMessages,
            context: {
              selectedText,
              selectionData,
              documentName,
              pageNumber: currentPageNumber,
            },
            timestamp: new Date()
          };

          const updatedHistory = chatHistory.filter(c => c.id !== conversation.id);
          updatedHistory.unshift(conversation);
          const trimmedHistory = updatedHistory.slice(0, 20);
          
          setChatHistory(trimmedHistory);
          saveChatHistory(trimmedHistory);
          if (!currentConversationId) {
            setCurrentConversationId(conversation.id);
          }
        }, 100);
        
        return newMessages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function sendChatMessage(message: string): Promise<string> {
    const isBoxSelection = selectedText === '[Box Selection]';
    const isFullDocument = !selectedText || selectedText === '[Full Document]';
    
    let contextType: 'full_document' | 'text_selection' | 'box_selection';
    let contextData = "";
    let mimeType = "text/plain";
    let additionalContext = null;

    if (snippets.length > 0) {
      // Build context from snippets list – user explicitly wants to use these selections
      contextType = 'text_selection';
      contextData = snippets.map(s => s.text).join('\n\n');
      mimeType = 'text/plain';
    } else if (isBoxSelection && selectionData?.base64Image) {
      // Box selection (image) context
      contextData = selectionData.base64Image.split(',')[1] || selectionData.base64Image;
      mimeType = 'image/png';
      contextType = 'box_selection';
    } else if (pdfFile) {
      // Default/fallback to the full document whenever no explicit snippets are present
      const base64Data = await convertFileToBase64(pdfFile);
      if (!base64Data) {
        throw new Error('Failed to process document');
      }
      contextData = base64Data.split(',')[1] || base64Data;
      mimeType = pdfFile.type || 'application/pdf';
      contextType = 'full_document';
    } else if (selectedText && selectedText !== '[Full Document]') {
      // As a last resort (e.g. no PDF file provided) fall back to plain-text selection
      contextData = selectedText;
      mimeType = 'text/plain';
      contextType = 'text_selection';
    } else {
      throw new Error('No content available for chat');
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          type: contextType,
          data: contextData,
          mimeType,
          documentName,
          selectedText: contextType === 'text_selection' ? selectedText : undefined,
          lineNumbers: getLineNumbers(selectedText),
          additionalContext
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to get chat response');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Chat request failed');
    }
    
    return data.message || 'I apologize, but I couldn\'t generate a proper response. Please try rephrasing your question.';
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied to clipboard",
        description: "Message has been copied successfully.",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    // Save current conversation if it has messages
    if (messages.length > 0) {
      saveCurrentConversation();
    }
    
    setMessages([]);
    setInputMessage("");
    setIsLoading(false);
    setCopiedMessageId(null);
    setCurrentConversationId(null);
    loadedFromHistoryRef.current = false;
  };

  const handleClose = () => {
    // Save current conversation before closing
    if (messages.length > 0) {
      saveCurrentConversation();
    }

    // Do NOT reset chat state here to preserve the current conversation when the sidebar is reopened
    // resetChat();
    onClose();
  };

  const isBoxSelection = selectedText === '[Box Selection]';
  const isFullDocument = !selectedText || selectedText === '[Full Document]';

  const resetToNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInputMessage("");
    setIsLoading(false);
    setCopiedMessageId(null);
    loadedFromHistoryRef.current = false;
    try {
      localStorage.removeItem('docmate-active-chat-id');
    } catch {/* ignore */}
    // Create fresh welcome message directly
    const welcomeMsg = buildWelcomeMessage();
    setMessages([welcomeMsg]);
  };

  const deleteConversation = (id: string) => {
    const updated = chatHistory.filter(c => c.id !== id);
    setChatHistory(updated);
    saveChatHistory(updated);
    if (currentConversationId === id) {
      // If user deletes the chat they are currently in, reset to a fresh chat **without**
      // saving the soon-to-be-deleted conversation back into history.
      resetToNewChat();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={sidebarRef}
      className="rounded-xl shadow-lg bg-background flex flex-col overflow-hidden h-full"
      style={{ width: sidebarWidth }}
    >
      <TooltipProvider>
        <Card className="h-full flex flex-col overflow-hidden rounded-xl">
          <CardHeader className="pb-3 border-b border-border/50 rounded-t-xl px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="h-4 w-4 text-primary" />
                {documentName && documentName.length > 30 ? documentName.substring(0, 30) + '...' : documentName}
              </CardTitle>
              
              <div className="flex items-center gap-1">
                {/* Previous Conversations Dropdown */}
                <DropdownMenu>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Previous conversations
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-64 max-h-60 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                      <DropdownMenuItem disabled>
                        <span className="text-muted-foreground text-xs">No previous conversations</span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        {chatHistory.map((conversation) => (
                          <DropdownMenuItem
                            key={conversation.id}
                            onClick={() => loadConversation(conversation)}
                            className={cn(
                              "text-xs flex items-center gap-2 p-2 justify-between",
                              currentConversationId === conversation.id && "bg-primary/10"
                            )}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate w-full">
                                {conversation.title}
                              </span>
                              <span className="text-muted-foreground text-[10px]">
                                {conversation.timestamp.toLocaleDateString()} • {conversation.messages.length} msgs
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conversation.id);
                              }}
                              aria-label="Delete conversation"
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* New Conversation Button */}
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={startNewConversation}
                      aria-label="New conversation"
                      className="h-7 w-7"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Start new conversation
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden rounded-b-xl">
            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0 px-6 py-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "relative group",
                      message.role === 'assistant' ? 'pl-4' : 'pl-4'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 w-1 h-full rounded-full',
                        message.role === 'assistant'
                          ? 'bg-primary'
                          : message.role === 'context'
                          ? 'bg-primary/50'
                          : 'bg-muted'
                      )}
                    />
                    
                    <div className="flex items-start">
                      <div
                        className={cn(
                          'flex-1 min-w-0 space-y-1 rounded-lg px-4 py-2',
                          message.role === 'assistant'
                            ? 'bg-primary/5'
                            : message.role === 'context'
                            ? 'bg-primary/10'
                            : 'bg-muted/10'
                        )}
                      >
                        <div className="text-sm">
                          {message.role === 'assistant' ? (
                            <FormattedContent content={message.content} />
                          ) : message.role === 'context' ? (
                            <div className="inline-flex items-center gap-1.5 text-primary text-xs">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{message.content.replace(/\n/g, ' ')}</span>
                              {message.linesCount && (
                                <span className="opacity-70">• {message.linesCount} lines</span>
                              )}
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  <span className="text-green-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isLoading && (
                  <div className="pl-4 relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary rounded-full" />
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-2 h-2 bg-primary rounded-full opacity-80"></div>
                          <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
                          <div className="w-2 h-2 bg-primary rounded-full opacity-40"></div>
                          <span className="text-xs text-muted-foreground ml-1">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t relative">
              {/* Citation header - only show for text selections */}
              {snippets.length > 0 && (
                <div className="px-3 py-2.5 border-b border-border/50 space-y-2 max-h-40 overflow-y-auto">
                  {snippets.map(snippet => (
                    <div key={snippet.id} className="inline-flex items-center border border-primary/20 rounded-md py-1.5 px-2 bg-primary/5 max-w-full group text-xs text-primary">
                      <FileText className="h-3 w-3 flex-shrink-0 mr-1" />
                      <span className="flex-1 truncate font-medium">
                        {snippet.text.replace(/\n/g, ' ')}
                      </span>
                      <span className="flex-shrink-0 opacity-70 ml-1">• {snippet.linesCount} lines</span>
                      <button
                        onClick={() => removeSnippet(snippet.id)}
                        className="flex-shrink-0 ml-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove snippet"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-3">
                <div className="relative">
                  <Textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setInputMessage(e.target.value);
                      // Auto-adjust height
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; // Max 8 lines (approx)
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Message..."
                    disabled={isLoading}
                    className="pr-12 text-sm bg-transparent border-[1.5px] rounded-lg min-h-[36px] max-h-[200px] resize-none overflow-y-auto border-primary/20 focus-visible:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className={cn(
                      "absolute right-1 bottom-1 h-7 rounded-md px-2.5",
                      isLoading ? "bg-muted" : "bg-primary/10 hover:bg-primary/20 text-primary"
                    )}
                    variant="ghost"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
} 