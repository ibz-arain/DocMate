"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy, FileStack, Building2, ReceiptText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSidebar } from "@/components/custom-sidebar";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

interface DocumentTypeOption {
  title: string;
  icon: React.ReactNode;
  description: string;
  demoType: string;
}

const documentTypeOptions: DocumentTypeOption[] = [
  {
    title: "T4 Tax Form",
    icon: <FileStack className="h-5 w-5" />,
    description: "Process T4 tax slips",
    demoType: "t4"
  },
  {
    title: "Bank Statement",
    icon: <Building2 className="h-5 w-5" />,
    description: "Analyze bank statements",
    demoType: "bank"
  },
  {
    title: "Store Receipt",
    icon: <ReceiptText className="h-5 w-5" />,
    description: "Process store receipts",
    demoType: "receipt"
  }
];

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'text' | 'analysis'>('json');
  const [extractedText, setExtractedText] = useState<string>("");
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
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [uploadDocType, setUploadDocType] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      resetStates();
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      resetStates();
    }
  };

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

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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
        documentType: "Business Proposal",
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
    setSelectedDemo(demoType);
    // Here you would typically load demo data based on the selected type
    const demoData = getDemoData(demoType);
    setAiInsights(demoData.insights);
    setExtractedText(demoData.text);
    setIsProcessed(true);
  };

  const getDemoData = (demoType: string) => {
    // Mock demo data for different document types
    const demos: Record<string, any> = {
      t4: {
        insights: {
          summary: "This is a T4 tax slip for the year 2023, showing employment income and deductions.",
          keywords: ["employment income", "tax deductions", "CPP contributions", "EI premiums"],
          sentiment: "Neutral",
          rawJson: {
            documentType: "T4 Tax Slip",
            metadata: {
              year: "2023",
              employer: "Demo Corp",
              employeeNumber: "12345"
            },
            content: {
              employmentIncome: "$75,000",
              taxDeducted: "$15,000",
              cppContributions: "$3,754.45",
              eiPremiums: "$952.74"
            }
          }
        },
        text: "T4 Statement of Remuneration Paid\nTax Year: 2023\nEmployer: Demo Corp\nEmployee: John Smith\nBox 14 - Employment Income: $75,000\nBox 22 - Income Tax Deducted: $15,000\n..."
      },
      bank: {
        insights: {
          summary: "Monthly bank statement showing transactions, deposits, and withdrawals for January 2024.",
          keywords: ["deposits", "withdrawals", "balance", "transactions"],
          sentiment: "Positive",
          rawJson: {
            documentType: "Bank Statement",
            metadata: {
              bank: "Demo Bank",
              accountType: "Checking",
              period: "Jan 2024"
            },
            content: {
              openingBalance: "$5,432.10",
              closingBalance: "$6,789.45",
              transactions: [
                { type: "Deposit", amount: "$2,500.00", date: "2024-01-05" },
                { type: "Withdrawal", amount: "$-750.00", date: "2024-01-15" }
              ]
            }
          }
        },
        text: "Demo Bank Statement\nAccount: ****1234\nPeriod: January 1-31, 2024\nOpening Balance: $5,432.10\nClosing Balance: $6,789.45\n..."
      },
      receipt: {
        insights: {
          summary: "Retail purchase receipt from Demo Store showing itemized purchases and payment details.",
          keywords: ["retail", "purchase", "items", "payment"],
          sentiment: "Neutral",
          rawJson: {
            documentType: "Store Receipt",
            metadata: {
              store: "Demo Store",
              date: "2024-02-15",
              transactionId: "RCP-123456"
            },
            content: {
              items: [
                { name: "Item 1", price: "$29.99", quantity: 2 },
                { name: "Item 2", price: "$15.99", quantity: 1 }
              ],
              subtotal: "$75.97",
              tax: "$9.88",
              total: "$85.85"
            }
          }
        },
        text: "Demo Store\nDate: Feb 15, 2024\nItem 1 x2 - $29.99\nItem 2 x1 - $15.99\nSubtotal: $75.97\nTax: $9.88\nTotal: $85.85\n..."
      }
    };

    return demos[demoType] || demos.receipt; // Default to receipt if demo type not found
  };

  const handleDemoUpload = (demoType: string) => {
    // Implement the logic to handle demo upload
    console.log("Demo upload not implemented yet");
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
                  {!uploadDocType ? "Select Document Type" : "Upload Document"}
                </CardTitle>
                {uploadDocType && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground"
                  >
                    Selected: {uploadDocType}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadDocType(null)}
                      className="ml-2 h-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                      Change
                    </Button>
                  </motion.div>
                )}
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {!uploadDocType ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Select Document Type</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {documentTypeOptions.map((type) => (
                          <Button
                            key={type.title}
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
                            onClick={() => setUploadDocType(type.title)}
                          >
                            <div className="h-12 w-12 flex items-center justify-center text-primary">
                              {type.icon}
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{type.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">Upload {uploadDocType}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadDocType("")}
                            className="h-8"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
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
                                Drop your {uploadDocType.toLowerCase()} here
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

                      <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" onClick={() => handleDemoUpload(
                          documentTypeOptions.find(t => t.title === uploadDocType)?.demoType || "default"
                        )}>
                          Try Demo
                        </Button>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
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