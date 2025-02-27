"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy, FileStack, Building2, ReceiptText, Stethoscope, BatteryCharging, Table as TableIcon, History, Eye, Filter, Search, Trash2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSidebar } from "@/components/custom-sidebar";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { DocumentType, DocumentState, ProcessingDocType, DocumentStateMap } from "@/types/document";
import { DocumentUploader } from "@/components/document/document-uploader";
import { DocumentViewer } from "@/components/document/document-viewer";
import { DocumentInfo } from "@/components/document/document-info";
import { HistorySection } from "@/components/document/history-section";
import { generateMarkdown } from "@/lib/document-utils";

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
  },
  'history': {
    title: 'Document History',
    description: 'View and manage your document history'
  }
};

interface SavedDocument {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  confidence: number;
  contentJson: any;
  createdAt: string;
  updatedAt: string;
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-6 h-full">
      {/* Main Table Loading Skeleton */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <CardContent className="p-0">
            <div className="rounded-md border h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Stats Loading Skeleton */}
      <div className="w-80 flex-none space-y-6">
        {/* Document Types Card */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function createInitialState(): DocumentState {
  return {
    file: null,
    isProcessed: false,
    selectedDoc: null,
    extractedText: "",
    error: null,
    isSaved: false,
  };
}

export default function DemoPage() {
  const [documentStates, setDocumentStates] = useState<DocumentStateMap>({
    't4': createInitialState(),
    'bank': createInitialState(),
    'receipt': createInitialState(),
    'dental': createInitialState(),
    'electricity': createInitialState(),
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('json');
  const [selectedType, setSelectedType] = useState<DocumentType>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const currentState = selectedType && selectedType !== 'history' 
    ? documentStates[selectedType as ProcessingDocType] 
    : createInitialState();

  const updateCurrentDocumentState = (updates: Partial<DocumentState>) => {
    if (!selectedType || selectedType === 'history') return;
    
    const docType = selectedType as ProcessingDocType;
    setDocumentStates((prev: DocumentStateMap) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        ...updates
      }
    }));
  };

  const validateFileType = (file: File): boolean => {
    const supportedTypes = {
      'image/jpeg': true,
      'image/png': true,
      'image/gif': true,
      'image/webp': true,
      'application/pdf': true
    } as const;
    
    if (!file) {
      updateCurrentDocumentState({ error: 'No file selected.' });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      updateCurrentDocumentState({ error: 'File size exceeds 10MB limit.' });
      return false;
    }
    
    if (!(file.type in supportedTypes)) {
      updateCurrentDocumentState({ 
        error: `Unsupported file type: ${file.type}. Please upload a PDF or image file (JPG, PNG, GIF, WebP).` 
      });
      return false;
    }
    return true;
  };

  const validateDocumentContent = (result: any): boolean => {
    if (!result.analysis?.documentType) {
      updateCurrentDocumentState({ error: 'Unable to determine document type. Please ensure you uploaded the correct document.' });
      return false;
    }

    const expectedTypes = {
      't4': ['T4', 'Tax', 'T4 Tax Slip', 'Tax Form'],
      'bank': ['Bank Statement', 'Bank Document', 'Account Statement'],
      'receipt': ['Store Receipt', 'Receipt', 'Sales Receipt', 'Purchase Receipt'],
      'dental': ['Dental Claim', 'Dental Form', 'Dental Insurance Claim'],
      'electricity': ['Electricity Bill', 'Utility Bill', 'Electric Bill']
    };

    const detectedType = result.analysis.documentType;
    const expectedTypeArray = expectedTypes[selectedType as keyof typeof expectedTypes] || [];
    
    if (!expectedTypeArray.some(type => detectedType.toLowerCase().includes(type.toLowerCase()))) {
      updateCurrentDocumentState({ 
        error: `This document appears to be a "${detectedType}" which doesn't match the selected document type. Please verify and try again.` 
      });
      return false;
    }

    return true;
  };

  const handleDemoSelect = (demoType: string) => {
    if (demoType === 'history') {
      setShowHistory(true);
      setSelectedType('history');
      return;
    }
    setShowHistory(false);
    setSelectedType(demoType as DocumentType);
  };

  const handleNewDocument = () => {
    if (!selectedType) return;
    setDocumentStates((prev: DocumentStateMap) => ({
      ...prev,
      [selectedType]: createInitialState()
    }));
  };

  const handleSaveDocument = async () => {
    if (!user || !selectedType || !currentState.selectedDoc?.contentJson || currentState.isSaved) return;

    try {
      setIsProcessing(true);
      const contentWithAnalysis = {
        ...currentState.selectedDoc.contentJson,
        analysis: {
          summary: currentState.selectedDoc.summary,
          keywords: currentState.selectedDoc.keywords,
          insights: currentState.selectedDoc.rawJson?.analysis?.insights || [],
          confidenceScore: currentState.selectedDoc.rawJson?.analysis?.confidenceScore || 0,
          documentType: currentState.selectedDoc.rawJson?.analysis?.documentType || selectedType
        }
      };

      const documentData = {
        title: currentState.file?.name || `${selectedType.toUpperCase()} Document`,
        type: selectedType,
        date: new Date().toISOString(),
        confidence: currentState.selectedDoc.rawJson?.analysis?.confidenceScore ? 
          Math.round(currentState.selectedDoc.rawJson.analysis.confidenceScore * 100) : 95,
        contentJson: contentWithAnalysis
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save document');
      }

      updateCurrentDocumentState({ isSaved: true });
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(currentState.selectedDoc?.contentJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentState.file?.name || 'document'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const markdownContent = generateMarkdown(currentState.selectedDoc?.contentJson);
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentState.file?.name || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const content = currentState.selectedDoc?.contentJson;
    let csvContent = '';
    
    if (content.metadata) {
      csvContent += 'Metadata\n';
      Object.entries(content.metadata).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value as any).forEach(([subKey, subValue]) => {
            csvContent += `${key},${subKey},${subValue}\n`;
          });
        } else {
          csvContent += `${key},,${value}\n`;
        }
      });
      csvContent += '\n';
    }

    if (content.content) {
      csvContent += 'Content\n';
      Object.entries(content.content).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          const headers = Object.keys(value[0] || {});
          csvContent += `${key}\n${headers.join(',')}\n`;
          value.forEach(item => {
            csvContent += `${Object.values(item).join(',')}\n`;
          });
        } else if (typeof value === 'object') {
          Object.entries(value as any).forEach(([subKey, subValue]) => {
            csvContent += `${key},${subKey},${subValue}\n`;
          });
        }
        csvContent += '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentState.file?.name || 'document'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processDocument = async () => {
    if (!currentState.file || !selectedType) {
      updateCurrentDocumentState({ error: "Please select a document type and upload a file first" });
      return;
    }

    if (!validateFileType(currentState.file)) {
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      let currentProgress = 0;

      // Helper function to add small random variation (only positive)
      const addVariation = (value: number, range: number = 0.5) => {
        const variation = Math.random() * range;
        return value + variation;
      };

      // Function to create micro-movements in progress
      const microMovement = async (baseProgress: number, duration: number = 800) => {
        const smallSteps = Math.floor(duration / 100); // Update every 100ms
        
        for (let i = 0; i < smallSteps; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          // Add only positive tiny variations
          const variation = Math.random() * 0.3;
          const newProgress = Math.min(baseProgress + variation, baseProgress + 0.5);
          currentProgress = Math.max(currentProgress, newProgress);
          setProgress(Math.round(currentProgress * 10) / 10);
        }
      };

      // Function to smoothly increment progress with natural variation
      const incrementProgress = async (start: number, end: number, duration: number) => {
        const steps = Math.floor((end - start) * 1.5); // More granular steps
        const baseStepDelay = duration / steps;
        
        for (let i = 1; i <= steps; i++) {
          // Add variation to the delay between steps
          const stepDelay = addVariation(baseStepDelay, baseStepDelay * 0.3);
          await new Promise(resolve => setTimeout(resolve, stepDelay));
          
          // Calculate progress with slight positive variation
          const rawProgress = start + ((end - start) * (i / steps));
          const progress = Math.min(end, rawProgress + (Math.random() * 0.3));
          currentProgress = Math.max(currentProgress, progress);
          setProgress(Math.round(currentProgress * 10) / 10);
        }
      };

      // Initial jump to show quick response
      await incrementProgress(0, 8, 300);
      
      // Slower progress through main processing stages with natural pauses
      const stages = [
        { end: 35, duration: 2500 },
        { end: 58, duration: 3000 },
        { end: 73, duration: 2800 },
        { end: 89, duration: 2500 }
      ];

      for (const stage of stages) {
        await incrementProgress(currentProgress, stage.end, stage.duration);
        // Add micro-movements during "processing" pauses
        const pauseDuration = addVariation(1500, 500);
        await microMovement(currentProgress, pauseDuration);
      }

      // Process the document
      let result;
      try {
        // Validate file size before processing
        if (currentState.file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }

        let base64Data = await convertFileToBase64(currentState.file);
        if (!base64Data || typeof base64Data !== 'string') {
          throw new Error('Failed to convert file to base64');
        }
        base64Data = base64Data.split(',')[1] || base64Data;

        const requestData = {
          imageData: base64Data,
          mimeType: currentState.file.type || 'application/octet-stream'
        };

        if (!requestData.imageData) {
          throw new Error('Invalid file data');
        }

        const endpoint = `/api/analyze/${selectedType}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          let errorMessage;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || 'Server processing error';
          } else {
            errorMessage = response.statusText || 'Server processing error';
          }
          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }
        result = await response.json();

        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response data from server');
        }

        if (!result.success) {
          throw new Error(result.error || 'Processing failed');
        }

        if (!result.analysis) {
          throw new Error('No analysis data received');
        }

        if (!validateDocumentContent(result)) {
          throw new Error('Invalid document content');
        }
      } catch (error) {
        throw error;
      }

      // Quick but smooth jump to completion
      await incrementProgress(currentProgress, 99, 300);
      await microMovement(99, 400); // Small movements at 99%
      
      // Final jump to 100%
      setProgress(100);
      
      // Brief pause at 100%
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Now update the state with results
      const updates = {
        extractedText: result.analysis.content?.text || "No text extracted",
        selectedDoc: {
          summary: result.analysis.analysis?.summary || "",
          keywords: result.analysis.analysis?.keywords || [],
          sentiment: result.analysis.analysis?.sentiment || "",
          rawJson: result.analysis,
          contentJson: result.result
        },
        isProcessed: true,
        error: null
      };

      // Update all states at once after showing 100%
      updateCurrentDocumentState(updates);
      
      console.log("Document processed successfully!");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      updateCurrentDocumentState({ error: errorMessage });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showHistory) {
      return (
        <div className="flex h-full overflow-hidden bg-background">
          <CustomSidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onSelectDemo={handleDemoSelect}
            selectedType="history"
          />
        <HistorySection user={user} />
      </div>
    );
  }

  if (!currentState.isProcessed) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onSelectDemo={handleDemoSelect}
          selectedType={selectedType}
        />
        <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
          <DocumentUploader
            selectedType={selectedType}
            currentState={currentState}
            isProcessing={isProcessing}
            progress={progress}
            onProcessDocument={processDocument}
            onFileChange={(file: File | null) => updateCurrentDocumentState({ file, error: null })}
            onSelectType={(type) => {
              setShowHistory(false);
              setSelectedType(type);
            }}
          />
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
        <main className="flex-1 overflow-y-auto md:pt-6 md:pr-6 md:px-0 pt-14 px-4">
          <div className="grid gap-6 pb-6 h-full lg:grid-cols-[minmax(0,_2fr)_minmax(250px,_300px)] grid-cols-1">
            <DocumentViewer
              currentState={currentState}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <DocumentInfo
              currentState={currentState}
              isProcessing={isProcessing}
              user={user}
              onDownloadJson={downloadJson}
              onDownloadMarkdown={downloadMarkdown}
              onDownloadCsv={downloadCsv}
              onSaveDocument={handleSaveDocument}
              onNewDocument={handleNewDocument}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

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
                          <td className="py-2">
                            {typeof subValue === 'object' 
                              ? JSON.stringify(subValue, null, 2)
                              : String(subValue)}
                          </td>
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
                                : String(subValue)}
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