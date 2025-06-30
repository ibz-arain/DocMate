"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  CheckCircle, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface FullDocumentSummarizePopupProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  documentName?: string;
}

export function FullDocumentSummarizePopup({ 
  isOpen, 
  onClose, 
  result, 
  documentName = "Document" 
}: FullDocumentSummarizePopupProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const summaryText = result?.analysis?.content || result?.analysis?.summary || '';
    if (!summaryText) return;
    
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Document summary has been copied successfully.",
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

  if (!isOpen) return null;

  const summaryText = result?.analysis?.content || result?.analysis?.summary || '';
  const wordCount = summaryText.split(/\s+/).filter((word: string) => word.length > 0).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-4xl max-h-[85vh] overflow-hidden"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="relative bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Document Summary</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {documentName} • {wordCount} words
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <FileText className="h-3 w-3 mr-1" />
                    Full Document
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="flex flex-col h-[60vh]">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {summaryText ? (
                      <FormattedContent content={summaryText} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No summary content available</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {summaryText && (
                  <div className="border-t bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Summary generated from entire document
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Summary
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 