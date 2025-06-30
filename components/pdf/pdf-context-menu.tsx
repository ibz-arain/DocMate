"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Table, 
  FileCode, 
  Copy,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfContextMenuProps {
  position: {
    top: number;
    left: number;
    isPageRelative?: boolean;
  };
  selectedText: string;
  isAnalyzing: boolean;
  onQuickSummarize: () => void;
  onSummarizePopup: () => void;
  onQuickFormat: () => void;
  onTemplateFormat: () => void;
  onCopy: () => void;
  onClose: () => void;
}

export function PdfContextMenu({
  position,
  selectedText,
  isAnalyzing,
  onQuickSummarize,
  onSummarizePopup,
  onQuickFormat,
  onTemplateFormat,
  onCopy,
  onClose
}: PdfContextMenuProps) {
  const menuItems = [
    {
      id: 'summarize-popup',
      label: 'Quick Summarize',
      icon: Sparkles,
      onClick: onSummarizePopup,
      disabled: false
    },
    {
      id: 'quick-format',
      label: 'Quick Format',
      icon: Table,
      onClick: onQuickFormat,
      disabled: isAnalyzing
    },
    {
      id: 'template-format',
      label: 'Template Format',
      icon: FileCode,
      onClick: onTemplateFormat,
      disabled: isAnalyzing
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      onClick: onCopy,
      disabled: false
    }
  ];

  return (
    <div
      className={cn(
        "z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        position.isPageRelative ? 'absolute' : 'fixed'
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              "hover:bg-accent hover:text-accent-foreground",
              "justify-start h-auto"
            )}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {isAnalyzing && (item.id === 'quick-summarize' || item.id === 'quick-format' || item.id === 'template-format') ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconComponent className="h-4 w-4" />
            )}
            <span className="font-medium">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
} 