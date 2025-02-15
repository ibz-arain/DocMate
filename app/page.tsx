"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
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

  if (!isProcessed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">DocMate</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  Drag and drop your PDF here
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  id="file-upload"
                />
                <Button
                  onClick={() => document.getElementById("file-upload")?.click()}
                  variant="outline"
                  className="mt-4"
                >
                  Select File
                </Button>
              </motion.div>
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4"
                  >
                    <p className="text-sm text-center">Selected: {file.name}</p>
                    <Button
                      onClick={processDocument}
                      className="mt-2 w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Process Document"}
                    </Button>
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Progress value={progress} className="mt-2" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        className="border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">DocMate</h1>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold">Document Processing</h2>
                  <nav className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Documents
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      <Zap className="mr-2 h-4 w-4" />
                      AI Analysis
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      <PanelRightOpen className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
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
                <ScrollArea className="h-[600px] rounded-md border p-4">
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
          </div>

          {/* Sidebar */}
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
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
        </div>
      </main>
    </div>
  );
}
