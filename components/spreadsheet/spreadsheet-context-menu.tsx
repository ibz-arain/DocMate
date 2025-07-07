"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Table, 
  FileCode, 
  Copy,
  Loader2,
  Sparkles,
  MessageCircle,
  Calculator,
  TrendingUp,
  PieChart
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SpreadsheetContextMenuProps {
  position: {
    top: number;
    left: number;
  };
  selectedCells: string;
  selectedRange?: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null;
  onSummarizeData: () => void;
  onTemplateFormat: () => void;
  onChatPopup: () => void;
  onCopy: () => void;
  onCreateChart: () => void;
  onClose: () => void;
}

export function SpreadsheetContextMenu({
  position,
  selectedCells,
  selectedRange,
  onSummarizeData,
  onTemplateFormat,
  onChatPopup,
  onCopy,
  onCreateChart,
  onClose
}: SpreadsheetContextMenuProps) {
  // Check if we have valid selection
  const hasSelection = selectedCells.trim().length > 0;
  const hasMultipleCells = selectedRange && (
    selectedRange.endRow !== selectedRange.startRow || 
    selectedRange.endCol !== selectedRange.startCol
  );

  const menuItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled: boolean;
    tooltip?: string;
  }> = [
    {
      id: 'summarize-data',
      label: 'Summarize Data',
      icon: Sparkles,
      onClick: onSummarizeData,
      disabled: !hasSelection,
      tooltip: !hasSelection ? 'Select cells first to summarize' : undefined
    },
    {
      id: 'create-chart',
      label: 'Create Chart',
      icon: PieChart,
      onClick: onCreateChart,
      disabled: !hasMultipleCells,
      tooltip: !hasMultipleCells ? 'Select multiple cells to create chart' : undefined
    },
    {
      id: 'template-format',
      label: 'Apply Template',
      icon: FileCode,
      onClick: onTemplateFormat,
      disabled: !hasSelection,
      tooltip: !hasSelection ? 'Select cells first to apply template' : undefined
    },
    {
      id: 'chat',
      label: 'Chat with AI',
      icon: MessageCircle,
      onClick: onChatPopup,
      disabled: !hasSelection,
      tooltip: !hasSelection ? 'Select cells first to chat about them' : undefined
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      onClick: onCopy,
      disabled: !hasSelection,
      tooltip: !hasSelection ? 'Select cells first to copy' : undefined
    }
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "fixed"
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