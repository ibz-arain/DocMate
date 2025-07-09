import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer as MousePointerIcon,
  BoxSelect as BoxSelectIcon,
  Sparkles,
  Table,
  FileText,
  Loader2,
  History,
  MessageCircle,
  X,
  FileTextIcon,
  Download,
} from "lucide-react";

export interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface SideToolbarProps {
  // Tool selection
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
  tools: Tool[];
  
  // Document state
  pdfFile: File | null;
  isAnalyzing: boolean;
  isLoading: boolean;
  processingAction: 'summarize' | 'quickformat' | null;
  
  // Chat state
  showChatSidebar: boolean;
  
  // History
  history: any[];
  showHistoryPopup: boolean;
  historyPopupPosition: { top: number; left: number };
  
  // Document type - to determine if PDF export should be shown
  documentType?: 'pdf' | 'spreadsheet';
  
  // Event handlers
  onDocumentSummarize: () => void;
  onDocumentQuickFormat: () => void;
  onFullDocTemplateFormatStart: () => void;
  onFullDocumentChat: () => void;
  onHistoryToggle: () => void;
  onClearPdf: () => void;
  onHistoryPopupToggle: (buttonRef: HTMLButtonElement | null) => void;
  onExportPdf: () => void;
}

export function SideToolbar({
  selectedTool,
  onToolSelect,
  tools,
  pdfFile,
  isAnalyzing,
  isLoading,
  processingAction,
  showChatSidebar,
  history,
  showHistoryPopup,
  historyPopupPosition,
  documentType = 'pdf',
  onDocumentSummarize,
  onDocumentQuickFormat,
  onFullDocTemplateFormatStart,
  onFullDocumentChat,
  onHistoryToggle,
  onClearPdf,
  onHistoryPopupToggle,
  onExportPdf,
}: SideToolbarProps) {
  const historyButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Card className="shadow-sm flex flex-col h-full w-[60px] pt-2">
      <CardContent className="flex flex-col h-full items-center gap-2 pb-2">
        <TooltipProvider delayDuration={0}>
          {tools.map(tool => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => onToolSelect(tool.id)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Document Analysis Tools */}
          {pdfFile && (
            <>
              <div className="w-full h-px bg-border my-2" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={onDocumentSummarize}
                    disabled={isAnalyzing || isLoading}
                  >
                    {processingAction === 'summarize' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>Summarize Document</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={onDocumentQuickFormat}
                    disabled={isAnalyzing || isLoading}
                  >
                    {processingAction === 'quickformat' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Table className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>Auto Format</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={onFullDocTemplateFormatStart}
                    disabled={isAnalyzing || isLoading}
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>Apply Template</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showChatSidebar ? "secondary" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={onFullDocumentChat}
                    disabled={isAnalyzing || isLoading}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>{showChatSidebar ? 'Close Chat' : 'Chat with Document'}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <div className="flex-1" />

          {/* History Button - Only show when PDF is loaded */}
          {pdfFile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 relative"
                  ref={historyButtonRef}
                  onClick={() => onHistoryPopupToggle(historyButtonRef.current)}
                >
                  <History className="h-5 w-5" />
                  {history.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {history.length > 9 ? '9+' : history.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>View Recent ({history.length})</p>
              </TooltipContent>
            </Tooltip>
          )}

          {pdfFile && (
            <div className="mt-auto pt-2 border-t border-border w-full flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                  >
                    <FileTextIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p className="font-medium">{pdfFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </TooltipContent>
              </Tooltip>
              
              {documentType === 'pdf' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                      onClick={onExportPdf}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center" className="text-green-600 dark:text-green-100 bg-green-500/10">
                    <p>Export PDF</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={onClearPdf}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center" className="text-red-600 dark:text-red-100 bg-red-500/10">
                  <p>Clear Document</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
} 