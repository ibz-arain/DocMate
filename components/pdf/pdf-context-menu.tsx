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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PdfContextMenuProps {
  position: {
    top: number;
    left: number;
    isPageRelative?: boolean;
  };
  selectedText: string;
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
  onQuickSummarize,
  onSummarizePopup,
  onQuickFormat,
  onTemplateFormat,
  onCopy,
  onClose
}: PdfContextMenuProps) {
  // Check if this is a right-click menu without text selection
  const isRightClickMenu = selectedText === "[Right-click menu]";
  const isBoxSelection = selectedText === "[Box Selection]";
  const hasTextSelection = !isRightClickMenu && !isBoxSelection && selectedText.trim().length > 0;

  const menuItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled: boolean;
    tooltip?: string;
  }> = [
    {
      id: 'summarize-popup',
      label: 'Summarize Selection',
      icon: Sparkles,
      onClick: onSummarizePopup,
      disabled: isRightClickMenu,
      tooltip: isRightClickMenu ? 'Select text first to summarize' : undefined
    },
    {
      id: 'quick-format',
      label: 'Auto Format',
      icon: Table,
      onClick: onQuickFormat,
      disabled: isRightClickMenu,
      tooltip: isRightClickMenu ? 'Select text first to format' : undefined
    },
    {
      id: 'template-format',
      label: 'Apply Template',
      icon: FileCode,
      onClick: onTemplateFormat,
      disabled: isRightClickMenu,
      tooltip: isRightClickMenu ? 'Select text first to apply template' : undefined
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      onClick: onCopy,
      disabled: isRightClickMenu,
      tooltip: isRightClickMenu ? 'Select text first to copy' : undefined
    }
  ];

  return (
    <TooltipProvider delayDuration={300}>
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
          
          const buttonElement = (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                "focus:bg-accent focus:text-accent-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "justify-start h-auto",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={item.disabled ? undefined : item.onClick}
              disabled={item.disabled}
            >
              <IconComponent className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Button>
          );

          // Wrap disabled items with tooltip
          if (item.disabled && item.tooltip) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  {buttonElement}
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return buttonElement;
        })}
      </div>
    </TooltipProvider>
  );
} 