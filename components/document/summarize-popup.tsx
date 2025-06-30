"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  CheckCircle, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';

// Component to render formatted text content
const FormattedContent = ({ content }: { content: string }) => {
  // Split by double line breaks for paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  
  const formatInlineText = (text: string) => {
    // Split text by formatting patterns while preserving them
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/);
    
    return parts.map((part, index) => {
      if (part.match(/^\*\*(.*)\*\*$/)) {
        const content = part.replace(/^\*\*/, '').replace(/\*\*$/, '');
        return <strong key={`bold-${index}`} className="font-semibold text-foreground">{content}</strong>;
      }
      if (part.match(/^\*(.*)\*$/) && !part.match(/^\*\*.*\*\*$/)) {
        const content = part.replace(/^\*/, '').replace(/\*$/, '');
        return <em key={`italic-${index}`} className="italic">{content}</em>;
      }
      if (part.match(/^`(.*)`$/)) {
        const content = part.replace(/^`/, '').replace(/`$/, '');
        return <code key={`code-${index}`} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{content}</code>;
      }
      return part;
    });
  };
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        // Check if it's a list item (starts with -, *, or number)
        if (paragraph.match(/^[\s]*[-*•]\s/m) || paragraph.match(/^[\s]*\d+\.\s/m)) {
          const items = paragraph.split('\n').filter(line => line.trim());
          const isOrdered = paragraph.match(/^[\s]*\d+\.\s/m);
          const ListTag = isOrdered ? 'ol' : 'ul';
          const listClass = isOrdered ? 'list-decimal list-inside space-y-2 ml-4' : 'list-disc list-inside space-y-2 ml-4';
          
          return (
            <ListTag key={`list-${index}`} className={listClass}>
              {items.map((item, itemIndex) => {
                const cleanItem = item.replace(/^[\s]*[-*•]\s*/, '').replace(/^[\s]*\d+\.\s*/, '').trim();
                return (
                  <li key={`item-${index}-${itemIndex}`} className="mb-2 text-sm leading-relaxed">
                    {formatInlineText(cleanItem)}
                  </li>
                );
              })}
            </ListTag>
          );
        }
        
        // Check if it's a heading (starts with ** and ends with **)
        if (paragraph.match(/^\*\*.*\*\*$/)) {
          const heading = paragraph.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
          return (
            <h3 key={`heading-${index}`} className="font-bold text-lg mb-3 mt-6 text-primary border-b border-border pb-2">
              {heading}
            </h3>
          );
        }
        
        // Regular paragraph
        if (paragraph.trim()) {
          // Handle line breaks within paragraphs
          const lines = paragraph.split('\n');
          return (
            <p key={`para-${index}`} className="mb-4 text-sm leading-relaxed text-foreground">
              {lines.map((line, lineIndex) => (
                <React.Fragment key={`line-${index}-${lineIndex}`}>
                  {formatInlineText(line)}
                  {lineIndex < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          );
        }
        
        return null;
      })}
    </div>
  );
};

interface SummarizePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  selectionData?: any;
  onSummarize: (text: string) => Promise<SummaryResult | null>;
  documentName?: string;
  currentPageNumber?: number;
  cachedResult?: SummaryResult | null;
}

interface SummaryResult {
  success: boolean;
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  processedAt: string;
}

export function SummarizePopup({ isOpen, onClose, selectedText, selectionData, onSummarize, documentName, currentPageNumber, cachedResult }: SummarizePopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { addHistoryEntry } = useHistory();

  // Auto-summarize when popup opens or use cached result
  useEffect(() => {
    if (isOpen && selectedText.trim() && !result && !isLoading) {
      if (cachedResult) {
        console.log('📋 Using cached result, NOT adding to history');
        setResult(cachedResult);
      } else {
        console.log('🔍 No cached result, will analyze and add to history');
        handleSummarize();
      }
    }
  }, [isOpen, selectedText, cachedResult]);

  const handleSummarize = async () => {
    if (!selectedText.trim()) return;
    
    setIsLoading(true);
    try {
      const isBoxSelection = selectedText === '[Box Selection]';
      
      if (isBoxSelection) {
        // Handle box selection using the custom API endpoint
        if (!selectionData?.base64Image) {
          throw new Error('Unable to extract image from selection area.');
        }
        
        const imageData = selectionData.base64Image.split(',')[1] || selectionData.base64Image;
        const response = await fetch('/api/analyze/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData,
            mimeType: 'image/png',
            customPrompt: `Analyze the image content and create an intelligent, comprehensive summary. 

Instructions:
1. Examine all text, graphics, charts, tables, diagrams, and visual elements in the image
2. Understand the context and meaning of the content, not just individual words
3. Create a well-structured summary that captures the key information and insights
4. Choose the best format based on the content - use bullet points, paragraphs, numbered lists, or mix formats as appropriate
5. Focus on clarity, usefulness, and comprehensiveness while being concise
6. Highlight the most important information and key takeaways
7. Use clear, accessible language that would be useful to the reader
8. Provide meaningful analysis and context, not just a list of words

The goal is to create a summary that demonstrates understanding of the content and provides valuable insights to the reader.`,
            outputFormat: {
              documentType: "Image Summary",
              tables: [{
                name: "summary_content",
                description: "Comprehensive summary of the image content with analysis and insights",
                type: "data" as const,
                fields: [{
                  name: "summary",
                  type: "string",
                  description: "The complete intelligent summary text with proper formatting and structure",
                  required: true
                }, {
                  name: "key_points",
                  type: "string",
                  description: "Main key points extracted from the content in bullet format",
                  required: false
                }, {
                  name: "content_type",
                  type: "string", 
                  description: "Type of content analyzed (e.g., text document, chart, table, diagram, etc.)",
                  required: false
                }]
              }]
            }
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to summarize image');
        }
        
        const data = await response.json();
        
        // Try to extract summary from various possible locations in the response
        let summary = '';
        
        if (data?.analysis?.content?.summary_content?.summary) {
          summary = data.analysis.content.summary_content.summary;
          
          // Enhance with key points if available
          if (data.analysis.content.summary_content.key_points) {
            summary += '\n\n**Key Points:**\n' + data.analysis.content.summary_content.key_points;
          }
        } else if (data?.result?.content?.summary_content?.summary) {
          summary = data.result.content.summary_content.summary;
          
          // Enhance with key points if available
          if (data.result.content.summary_content.key_points) {
            summary += '\n\n**Key Points:**\n' + data.result.content.summary_content.key_points;
          }
        } else if (data?.analysis?.content?.summary_content?.text) {
          // Fallback to old field name for backwards compatibility
          summary = data.analysis.content.summary_content.text;
        } else if (data?.result?.content?.summary_content?.text) {
          // Fallback to old field name for backwards compatibility
          summary = data.result.content.summary_content.text;
        } else if (data?.analysis?.analysis?.summary) {
          summary = data.analysis.analysis.summary;
        } else if (data?.analysis?.summary) {
          summary = data.analysis.summary;
        } else if (data?.rawText) {
          // Fallback to raw text if JSON parsing failed
          summary = data.rawText;
        } else {
          summary = 'No summary available';
        }
        
        // Format the result to match the expected SummaryResult interface
        const summaryResult = {
          success: true,
          summary,
          originalLength: 0, // Can't measure image length
          summaryLength: summary.length,
          compressionRatio: 0,
          processedAt: new Date().toISOString()
        };
        
        setResult(summaryResult);
        
        // Add to history
        console.log('🔄 Summarize popup: Adding to history...');
        addHistoryEntry({
          type: 'summary',
          title: selectedText.length > 50 ? `${selectedText.substring(0, 47)}...` : selectedText,
          content: summaryResult.summary,
          selectedText,
          selectionData,
          documentName,
          pageNumber: currentPageNumber,
        });
      } else {
        // Handle text selection using the original method
        const summaryResult = await onSummarize(selectedText);
        if (summaryResult) {
          setResult(summaryResult);
          
          // Add to history
          console.log('🔄 Summarize popup: Adding to history (text method)...');
          addHistoryEntry({
            type: 'summary',
            title: selectedText.length > 50 ? `${selectedText.substring(0, 47)}...` : selectedText,
            content: summaryResult.summary,
            selectedText,
            selectionData,
            documentName,
            pageNumber: currentPageNumber,
          });
        }
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.summary) return;
    
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied successfully.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const resetPopup = () => {
    setResult(null);
    setIsLoading(false);
    setCopied(false);
  };

  const handleClose = () => {
    resetPopup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-hidden"
        >
          <Card className="shadow-2xl border-0">
            <CardContent className="space-y-4 pt-6">
              {/* Loading State */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <Sparkles className="h-8 w-8 text-primary animate-pulse relative z-10" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 animate-pulse">
                    AI is crafting your summary...
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}

              {/* Summary Result */}
              {result && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  {/* Stats Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 dark:bg-primary/10 rounded-full">
                        <CheckCircle className="h-4 w-4 text-primary dark:text-primary" />
                      </div>
                      <span className="font-medium text-sm">Summary Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30">
                        {result.compressionRatio}% shorter
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {selectedText.length} → {result.summaryLength} chars
                      </Badge>
                    </div>
                  </div>

                  {/* Summary Content */}
                  <div className="bg-gradient-to-br from-background to-muted/30 border rounded-xl shadow-sm max-h-96 overflow-y-auto custom-scrollbar">
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <FormattedContent content={result.summary} />
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Generated by AI</span>
                    </div>
                    <span>
                      {new Date(result.processedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              {result && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3 pt-2"
                >
                  <Button 
                    onClick={handleCopy} 
                    variant="outline" 
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Summary
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={resetPopup} 
                    variant="outline"
                    className="transition-all"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Summary
                  </Button>
                  <Button 
                    onClick={handleClose}
                    variant="secondary"
                    className="transition-all"
                  >
                    Done
                  </Button>
                </motion.div>
              )}

              {isLoading && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={handleClose} size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 