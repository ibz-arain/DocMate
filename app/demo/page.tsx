"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy, FileStack, Building2, ReceiptText, Stethoscope, BatteryCharging, Table } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('json');
  const [extractedText, setExtractedText] = useState<string>("");
  const [selectedType, setSelectedType] = useState<DocumentType>(null);
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    keywords: string[];
    sentiment: string;
    rawJson: any;
    contentJson: any;
  }>({
    summary: "",
    keywords: [],
    sentiment: "",
    rawJson: null,
    contentJson: null
  });
  const [isProcessed, setIsProcessed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const droppedFile = acceptedFiles[0];
      if (droppedFile) {
        try {
          setIsProcessing(true);
          setFile(droppedFile);
          resetStates();
          
          const base64Data = await convertFileToBase64(droppedFile);
          const endpoint = `/api/analyze/${selectedType}`;
          
          console.log("Sending request to:", endpoint);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: base64Data,
              mimeType: droppedFile.type
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error('Server error:', result);
            throw new Error(result.error || 'Analysis failed');
          }
          
          if (result.success) {
            setExtractedText(result.analysis.content?.text || "No text extracted");
            setAiInsights({
              summary: result.analysis.analysis?.summary || "",
              keywords: result.analysis.analysis?.keywords || [],
              sentiment: result.analysis.analysis?.sentiment || "",
              rawJson: result.analysis,
              contentJson: result.result
            });
            setIsProcessed(true);
            console.log("Document processed successfully!");
          } else {
            throw new Error(result.error || 'Analysis failed');
          }
        } catch (error) {
          console.error("Error analyzing document:", error);
          setFile(null);
          // Show error to user (you might want to add a toast notification here)
        } finally {
          setIsProcessing(false);
        }
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB max size
    multiple: false
  });

  const resetStates = () => {
    setExtractedText("");
    setAiInsights({
      summary: "",
      keywords: [],
      sentiment: "",
      rawJson: null,
      contentJson: null
    });
    setProgress(0);
    setIsProcessed(false);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processDocument = async () => {
    if (!file || !selectedType) {
      console.error("Please select a document type and upload a file first");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error("Maximum file size is 10MB");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const base64Data = await convertFileToBase64(file);
      setProgress(20);
      
      console.log("Processing started: Converting and analyzing document...");

      const endpoint = `/api/analyze/${selectedType}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Data
        }),
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(80);

      if (result.success) {
        if (!result.analysis) {
          throw new Error("No analysis data received");
        }

        setExtractedText(result.analysis.content?.text || "No text extracted");
        setAiInsights({
          summary: result.analysis.analysis?.summary || "",
          keywords: result.analysis.analysis?.keywords || [],
          sentiment: result.analysis.analysis?.sentiment || "",
          rawJson: result.analysis,
          contentJson: result.result
        });
        setIsProcessed(true);
        console.log("Document processed successfully!");
      } else {
        throw new Error(result.error || 'Processing failed');
      }

      setProgress(100);
    } catch (error) {
      console.error("Error processing document:", error);
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        if (error.message.includes("API request failed")) {
          errorMessage = "Failed to connect to the analysis service";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Failed to process the document results";
        } else {
          errorMessage = error.message;
        }
      }

      console.error(errorMessage);
      setProgress(0);
    }
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log("JSON data copied to clipboard");
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
          selectedType={selectedType}
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
                      <Card className="relative border-2 border-dashed transition-all duration-200 hover:border-primary/50">
                        <CardContent className="p-0">
                          <div
                            {...getRootProps()}
                            className={cn(
                              "relative min-h-[300px] flex flex-col items-center justify-center gap-4 p-8 transition-all duration-200",
                              "cursor-pointer rounded-lg",
                              isDragActive ? "bg-primary/10 border-primary" : "hover:bg-primary/5",
                              "group"
                            )}
                          >
                            {file ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <div className="relative w-full max-w-md aspect-video">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt="Document preview"
                                    className="w-full h-full object-contain rounded-lg border shadow-sm"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="absolute top-2 right-2 bg-background/90 hover:bg-background"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                      }}
                                    >
                                      Change File
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="relative">
                                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <Upload className={cn(
                                    "h-12 w-12 transition-all duration-200",
                                    isDragActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                                  )} />
                                </div>
                                <div className="space-y-2 text-center relative">
                                  <p className={cn(
                                    "text-lg font-medium transition-colors duration-200",
                                    isDragActive ? "text-primary" : "text-foreground"
                                  )}>
                                    Drop your {documentTypeLabels[selectedType].title.toLowerCase()} here
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    or click to browse files
                                  </p>
                                  <div className={cn(
                                    "flex flex-wrap gap-2 justify-center text-xs text-muted-foreground mt-4",
                                    isDragActive && "text-primary/70"
                                  )}>
                                    <span className="px-2 py-1 rounded-full bg-muted">PNG</span>
                                    <span className="px-2 py-1 rounded-full bg-muted">JPG</span>
                                    <span className="px-2 py-1 rounded-full bg-muted">JPEG</span>
                                    <span className="px-2 py-1 rounded-full bg-muted">GIF</span>
                                    <span className="px-2 py-1 rounded-full bg-muted">WebP</span>
                                    <span className="px-2 py-1 rounded-full bg-muted">PDF</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Maximum file size: 10MB
                                  </p>
                                </div>
                              </>
                            )}
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
                            <Card className="bg-muted/50 border-primary/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={processDocument}
                                    disabled={isProcessing}
                                    size="sm"
                                    className={cn(
                                      "transition-all duration-500",
                                      isProcessing ? "bg-primary/10 text-primary" : "bg-primary"
                                    )}
                                  >
                                    {isProcessing ? (
                                      <>
                                        <div className="animate-spin mr-2">
                                          <RefreshCcw className="h-4 w-4" />
                                        </div>
                                        Processing...
                                      </>
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
                                    <Progress value={progress} className="mt-4 h-1" />
                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                      Analyzing document... {progress}%
                                    </p>
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
        selectedType={selectedType}
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
          <div className="grid gap-8 pb-6" style={{ 
            gridTemplateColumns: `minmax(0, ${isSidebarCollapsed ? '1fr' : '2fr'}) 350px`,
            transition: 'grid-template-columns 0.2s ease-in-out'
          }}>
            {/* Main Content Area */}
            <div className="space-y-4 min-w-0">
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
                        variant={activeTab === 'markdown' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('markdown')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Markdown
                      </Button>
                      <Button
                        variant={activeTab === 'formatted' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('formatted')}
                        className="flex items-center gap-2"
                      >
                        <Table className="h-4 w-4" />
                        Formatted
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
                            onClick={() => copyToClipboard(JSON.stringify(aiInsights.contentJson, null, 2))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm">
                              {JSON.stringify(aiInsights.contentJson, null, 2)}
                            </code>
                          </pre>
                        </motion.div>
                      )}
                      {activeTab === 'markdown' && (
                        <motion.div
                          key="markdown"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm whitespace-pre">
                              {generateMarkdown(aiInsights.contentJson)}
                            </code>
                          </pre>
                        </motion.div>
                      )}
                      {activeTab === 'formatted' && (
                        <motion.div
                          key="formatted"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          {generateFormattedView(aiInsights.contentJson)}
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
                            <h3 className="text-lg font-medium mb-2">Insights</h3>
                            <div className="space-y-2">
                              {aiInsights.rawJson?.analysis?.insights?.map((insight: string, index: number) => (
                                <p key={index} className="text-sm text-muted-foreground">
                                  • {insight}
                                </p>
                              ))}
                            </div>
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

            {/* Info Sidebar - Fixed width */}
            <div className="space-y-4 w-[350px]">
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
                        {aiInsights.contentJson?.documentType || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Page Count</h3>
                      <p className="text-sm text-muted-foreground">
                        {aiInsights.contentJson?.metadata?.pageCount || "N/A"}
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

const generateMarkdown = (data: any): string => {
  if (!data) return '';

  const padValue = (str: string, length: number) => {
    return str.padEnd(length, ' ');
  };

  const formatTableValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    // Handle multi-line addresses by replacing newlines with spaces
    return String(value)
      .replace(/\n\s*/g, ' ')  // Replace newlines and following whitespace with a single space
      .replace(/\s+/g, ' ')    // Normalize multiple spaces into single space
      .replace(/\|/g, '\\|')   // Escape pipe characters
      .trim();                 // Remove leading/trailing whitespace
  };

  const createTable = (data: Record<string, any>, headers: string[] = ['Property', 'Value']) => {
    // Calculate maximum widths for each column
    const columnWidths = headers.map(header => header.length);
    const rows = Object.entries(data).map(([key, value]) => {
      const formattedValue = formatTableValue(value);
      columnWidths[0] = Math.max(columnWidths[0], key.length);
      columnWidths[1] = Math.max(columnWidths[1], formattedValue.length);
      return [key, formattedValue];
    });

    // Add padding to ensure minimum column width
    columnWidths[0] = Math.max(columnWidths[0], 8);  // "Property"
    columnWidths[1] = Math.max(columnWidths[1], 5);  // "Value"

    // Create header
    let table = `| ${padValue(headers[0], columnWidths[0])} | ${padValue(headers[1], columnWidths[1])} |\n`;
    table += `|${'-'.repeat(columnWidths[0] + 2)}|${'-'.repeat(columnWidths[1] + 2)}|\n`;

    // Add rows
    rows.forEach(([key, value]) => {
      table += `| ${padValue(key, columnWidths[0])} | ${padValue(value, columnWidths[1])} |\n`;
    });

    return table;
  };

  const createArrayTable = (array: any[]) => {
    if (array.length === 0) return '';
    
    const headers = Object.keys(array[0]);
    const columnWidths = headers.map(header => header.length);

    // Calculate maximum width for each column
    array.forEach(item => {
      headers.forEach((header, index) => {
        const value = formatTableValue(item[header]);
        columnWidths[index] = Math.max(columnWidths[index], value.length);
      });
    });

    // Create header
    let table = '| ' + headers.map((header, i) => padValue(header, columnWidths[i])).join(' | ') + ' |\n';
    table += '|' + columnWidths.map(width => '-'.repeat(width + 2)).join('|') + '|\n';

    // Add rows
    array.forEach(item => {
      table += '| ' + headers.map((header, i) => {
        const value = formatTableValue(item[header]);
        return padValue(value, columnWidths[i]);
      }).join(' | ') + ' |\n';
    });

    return table;
  };

  let markdown = `# ${data.documentType}\n\n`;

  // Add metadata section
  if (data.metadata) {
    markdown += '## Metadata\n\n';
    Object.entries(data.metadata).forEach(([key, value]: [string, any]) => {
      markdown += `### ${key}\n\n`;
      if (typeof value === 'object' && !Array.isArray(value)) {
        markdown += createTable(value);
      } else {
        markdown += createTable({ [key]: value });
      }
      markdown += '\n';
    });
  }

  // Add content section
  if (data.content) {
    markdown += '## Content\n\n';
    Object.entries(data.content).forEach(([key, value]: [string, any]) => {
      markdown += `### ${key}\n\n`;
      if (Array.isArray(value) && value.length > 0) {
        markdown += createArrayTable(value);
      } else if (typeof value === 'object') {
        markdown += createTable(value);
      }
      markdown += '\n';
    });
  }

  return markdown;
};

const generateFormattedView = (data: any) => {
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{data.documentType}</h2>
        
        {/* Metadata Section */}
        {data.metadata && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Metadata</h3>
            {Object.entries(data.metadata).map(([key, value]: [string, any]) => (
              <div key={key} className="rounded-lg border">
                <div className="px-4 py-3 border-b bg-muted">
                  <h4 className="font-medium capitalize">{key}</h4>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <tr key={subKey} className="border-b last:border-0">
                          <td className="py-2 font-medium capitalize w-1/3">{subKey}</td>
                          <td className="py-2">{String(subValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Section */}
        {data.content && (
          <div className="space-y-6 mt-8">
            <h3 className="text-xl font-semibold">Content</h3>
            {Object.entries(data.content).map(([key, value]: [string, any]) => (
              <div key={key} className="rounded-lg border">
                <div className="px-4 py-3 border-b bg-muted">
                  <h4 className="font-medium capitalize">{key}</h4>
                </div>
                <div className="p-4">
                  {Array.isArray(value) ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(value[0] || {}).map((header) => (
                            <th key={header} className="py-2 text-left font-medium capitalize">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((item, index) => (
                          <tr key={index} className="border-b last:border-0">
                            {Object.values(item).map((cellValue, cellIndex) => (
                              <td key={cellIndex} className="py-2">
                                {String(cellValue)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full">
                      <tbody>
                        {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                          <tr key={subKey} className="border-b last:border-0">
                            <td className="py-2 font-medium capitalize w-1/3">{subKey}</td>
                            <td className="py-2">
                              {typeof subValue === 'object' 
                                ? JSON.stringify(subValue, null, 2)
                                : String(subValue)
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 