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
  onSummarize: (text: string) => Promise<SummaryResult | null>;
}

interface SummaryResult {
  success: boolean;
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  processedAt: string;
}

export function SummarizePopup({ isOpen, onClose, selectedText, onSummarize }: SummarizePopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Auto-summarize when popup opens
  useEffect(() => {
    if (isOpen && selectedText.trim() && !result && !isLoading) {
      handleSummarize();
    }
  }, [isOpen, selectedText]);

  const handleSummarize = async () => {
    if (!selectedText.trim()) return;
    
    setIsLoading(true);
    try {
      const summaryResult = await onSummarize(selectedText);
      if (summaryResult) {
        setResult(summaryResult);
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      toast({
        title: "Summarization failed",
        description: "Please try again.",
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
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Smart Summary
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
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
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                    className="flex-1 transition-all hover:scale-105"
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
                    className="transition-all hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Summary
                  </Button>
                  <Button 
                    onClick={handleClose}
                    className="transition-all hover:scale-105"
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