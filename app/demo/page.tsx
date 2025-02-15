"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy, FileStack, Building2, ReceiptText, Stethoscope, BatteryCharging } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSidebar } from "@/components/custom-sidebar";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

type DocumentType = 't4' | 'bank' | 'receipt' | 'dental' | 'electricity' | null;

const documentTypeLabels: Record<string, { title: string, description: string }> = {
  't4': {
    title: 'T4 Tax Form',
    description: 'Upload a picture or scan of your T4 tax slip'
  },
  'bank': {
    title: 'Bank Statement',
    description: 'Upload your bank statement document'
  },
  'receipt': {
    title: 'Store Receipt',
    description: 'Upload a picture of your store receipt'
  },
  'dental': {
    title: 'Dental Claim Form',
    description: 'Upload your dental insurance claim form'
  },
  'electricity': {
    title: 'Electricity Bill',
    description: 'Upload your electricity bill for analysis'
  }
};

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'text' | 'analysis'>('json');
  const [extractedText, setExtractedText] = useState<string>("");
  const [selectedType, setSelectedType] = useState<DocumentType>(null);
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    keywords: string[];
    sentiment: string;
    rawJson: any;
  }>({
    summary: "",
    keywords: [],
    sentiment: "",
    rawJson: null
  });
  const [isProcessed, setIsProcessed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const droppedFile = acceptedFiles[0];
      if (droppedFile?.type === "application/pdf") {
        setFile(droppedFile);
        resetStates();
      }
    }
  });

  const resetStates = () => {
    setExtractedText("");
    setAiInsights({
      summary: "",
      keywords: [],
      sentiment: "",
      rawJson: null
    });
    setProgress(0);
    setIsProcessed(false);
  };

  const processDocument = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate processing steps
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Mock data with raw JSON
      const mockRawJson = {
        documentType: selectedType ? documentTypeLabels[selectedType].title : "Unknown Document",
        metadata: {
          pageCount: 5,
          author: "John Doe",
          createdDate: "2024-02-15"
        },
        content: {
          title: "Strategic Business Initiative 2024",
          sections: [
            { heading: "Executive Summary", confidence: 0.95 },
            { heading: "Market Analysis", confidence: 0.88 },
            { heading: "Financial Projections", confidence: 0.92 }
          ]
        },
        analysis: {
          summary: "This document appears to be a business proposal outlining key strategies and objectives.",
          keywords: ["business", "strategy", "proposal", "objectives", "planning"],
          sentiment: "Positive",
          confidenceScore: 0.89
        }
      };

      setExtractedText("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");
      setAiInsights({
        summary: mockRawJson.analysis.summary,
        keywords: mockRawJson.analysis.keywords,
        sentiment: mockRawJson.analysis.sentiment,
        rawJson: mockRawJson
      });
      setIsProcessed(true);
    } catch (error) {
      console.error("Error processing document:", error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleDemoSelect = (demoType: string) => {
    // Set the selected type and reset states
    setSelectedType(demoType as DocumentType);
    resetStates();
    setFile(null);
  };

  if (!isProcessed) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onSelectDemo={handleDemoSelect}
        />
        
        <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  {selectedType ? documentTypeLabels[selectedType].title : "Select Document Type"}
                </CardTitle>
                {selectedType && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground mt-2"
                  >
                    {documentTypeLabels[selectedType].description}
                  </motion.div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedType ? (
                    <>
                      <Card className="relative border-2 border-dashed">
                        <CardContent className="pt-6 pb-8">
                          <div
                            {...getRootProps()}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 py-8 text-center",
                              isDragActive && "bg-primary/5"
                            )}
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="text-lg font-medium">
                                Drop your {documentTypeLabels[selectedType].title.toLowerCase()} here
                              </p>
                              <p className="text-sm text-muted-foreground">
                                or click to browse files
                              </p>
                            </div>
                            <input {...getInputProps()} />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <AnimatePresence>
                        {file && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <Card className="bg-muted/50">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-medium">{file.name}</p>
                                  </div>
                                  <Button
                                    onClick={processDocument}
                                    disabled={isProcessing}
                                    size="sm"
                                  >
                                    {isProcessing ? (
                                      <>Processing...</>
                                    ) : (
                                      <>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Process Document
                                      </>
                                    )}
                                  </Button>
                                </div>
                                {isProcessing && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    <Progress value={progress} className="mt-4" />
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Please select a document type from the sidebar to begin</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <CustomSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onSelectDemo={handleDemoSelect}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header 
          className="flex-shrink-0 border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-6 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">DocMate</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFile(null);
                  resetStates();
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Process New Document
              </Button>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-8 pb-6 grid-cols-1 lg:grid-cols-[1fr_350px]">
            {/* Main Content Area */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Results</span>
                    <div className="flex gap-2">
                      <Button
                        variant={activeTab === 'json' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('json')}
                        className="flex items-center gap-2"
                      >
                        <Code className="h-4 w-4" />
                        JSON
                      </Button>
                      <Button
                        variant={activeTab === 'text' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('text')}
                        className="flex items-center gap-2"
                      >
                        <FileSearch className="h-4 w-4" />
                        Text
                      </Button>
                      <Button
                        variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('analysis')}
                        className="flex items-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        Analysis
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-24rem)] min-h-[400px] rounded-md border p-4">
                    <AnimatePresence mode="wait">
                      {activeTab === 'json' && (
                        <motion.div
                          key="json"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2"
                            onClick={() => copyToClipboard(JSON.stringify(aiInsights.rawJson, null, 2))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm">
                              {JSON.stringify(aiInsights.rawJson, null, 2)}
                            </code>
                          </pre>
                        </motion.div>
                      )}
                      {activeTab === 'text' && (
                        <motion.div
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <h3 className="text-lg font-medium mb-2">Extracted Text</h3>
                          <p className="text-sm text-muted-foreground">{extractedText}</p>
                        </motion.div>
                      )}
                      {activeTab === 'analysis' && (
                        <motion.div
                          key="analysis"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-medium mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground">{aiInsights.summary}</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-2">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                              {aiInsights.keywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-2">Sentiment</h3>
                            <p className="text-sm text-muted-foreground">{aiInsights.sentiment}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Document Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button className="w-full" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Results
                    </Button>
                    <Button className="w-full" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Brain className="mr-2 h-4 w-4" />
                      Advanced Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">File Name</h3>
                      <p className="text-sm text-muted-foreground">{file?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Document Type</h3>
                      <p className="text-sm text-muted-foreground">
                        {aiInsights.rawJson?.documentType || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Page Count</h3>
                      <p className="text-sm text-muted-foreground">
                        {aiInsights.rawJson?.metadata?.pageCount || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Confidence Score</h3>
                      <p className="text-sm text-muted-foreground">
                        {(aiInsights.rawJson?.analysis?.confidenceScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Analysis Complete</span>
                      <span className="text-sm text-muted-foreground">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Document processed successfully
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 