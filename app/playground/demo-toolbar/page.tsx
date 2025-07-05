"use client";

import { useState } from "react";
import { CustomSidebar } from "@/components/custom-sidebar";
import { SideToolbar, Tool } from "@/components/document/side-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MousePointer as MousePointerIcon, BoxSelect as BoxSelectIcon, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function DemoToolbarPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>('text');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState<'summarize' | 'quickformat' | null>(null);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [historyPopupPosition, setHistoryPopupPosition] = useState({ top: 0, left: 0 });

  // Mock history data
  const history = [
    { id: 1, type: 'summary', content: 'Sample summary', timestamp: new Date() },
    { id: 2, type: 'quick-format', content: 'Sample format', timestamp: new Date() },
  ];

  // Define tools for this page
  const tools: Tool[] = [
    { id: 'text', label: 'Text Select', icon: <MousePointerIcon className="h-5 w-5" /> },
    { id: 'box', label: 'Box Select', icon: <BoxSelectIcon className="h-5 w-5" /> },
  ];

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    toast({
      title: "Tool Selected",
      description: `Switched to ${tool} tool`,
    });
  };

  const handleDocumentSummarize = () => {
    setIsAnalyzing(true);
    setProcessingAction('summarize');
    
    // Simulate processing
    setTimeout(() => {
      setIsAnalyzing(false);
      setProcessingAction(null);
      toast({
        title: "Document Summarized",
        description: "Document has been summarized successfully",
      });
    }, 2000);
  };

  const handleDocumentQuickFormat = () => {
    setIsAnalyzing(true);
    setProcessingAction('quickformat');
    
    // Simulate processing
    setTimeout(() => {
      setIsAnalyzing(false);
      setProcessingAction(null);
      toast({
        title: "Document Formatted",
        description: "Document has been formatted successfully",
      });
    }, 2000);
  };

  const handleFullDocTemplateFormatStart = () => {
    toast({
      title: "Template Format",
      description: "Template format feature triggered",
    });
  };

  const handleFullDocumentChat = () => {
    setShowChatSidebar(!showChatSidebar);
    toast({
      title: showChatSidebar ? "Chat Closed" : "Chat Opened",
      description: showChatSidebar ? "Chat sidebar has been closed" : "Chat sidebar has been opened",
    });
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    toast({
      title: "Document Cleared",
      description: "Document has been cleared",
    });
  };

  const handleHistoryPopupToggle = (buttonRef: HTMLButtonElement | null) => {
    if (!showHistoryPopup && buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      setHistoryPopupPosition({
        top: rect.top,
        left: rect.left
      });
    }
    setShowHistoryPopup(!showHistoryPopup);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <CustomSidebar selectedType="demo" />
      
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="grid gap-6 h-full lg:grid-cols-[1fr_auto] grid-cols-1">
          {/* Main Content */}
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Side Toolbar Demo</h1>
                <p className="text-muted-foreground">
                  This page demonstrates how the SideToolbar component can be reused across different pages.
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Tool: {selectedTool}</p>
                  <p className="text-sm text-muted-foreground">
                    {pdfFile ? `Loaded: ${pdfFile.name}` : 'No PDF loaded'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chat Sidebar: {showChatSidebar ? 'Open' : 'Closed'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side Toolbar */}
          <SideToolbar
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            tools={tools}
            pdfFile={pdfFile}
            isAnalyzing={isAnalyzing}
            isLoading={isLoading}
            processingAction={processingAction}
            showChatSidebar={showChatSidebar}
            history={history}
            showHistoryPopup={showHistoryPopup}
            historyPopupPosition={historyPopupPosition}
            onDocumentSummarize={handleDocumentSummarize}
            onDocumentQuickFormat={handleDocumentQuickFormat}
            onFullDocTemplateFormatStart={handleFullDocTemplateFormatStart}
            onFullDocumentChat={handleFullDocumentChat}
            onHistoryToggle={() => {}}
            onClearPdf={handleClearPdf}
            onHistoryPopupToggle={handleHistoryPopupToggle}
          />
        </div>
      </main>
    </div>
  );
} 