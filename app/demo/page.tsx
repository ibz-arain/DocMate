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

type DocumentType = 't4' | 'bank' | 'receipt' | 'dental' | 'electricity' | 'history' | null;

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

// History Component
function HistorySection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('formatted');
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDoc, setDeleteDoc] = useState<SavedDocument | null>(null);
  const { user } = useAuthContext();

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDeleteDocument = async () => {
    if (!deleteDoc) return;

    try {
      const response = await fetch(`/api/documents/${deleteDoc.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete document');

      setDocuments(docs => docs.filter(d => d.id !== deleteDoc.id));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleteDoc(null);
    }
  };

  const handleViewDocument = (doc: any) => {
    // Map the database fields to the expected format
    const mappedDoc = {
      ...doc,
      contentJson: typeof doc.content_json === 'string' 
        ? JSON.parse(doc.content_json) 
        : doc.content_json
    };
    setSelectedDoc(mappedDoc);
    setIsPreviewOpen(true);
  };

  // Filter documents for the table display
  const filteredDocuments = documents
    .filter((doc) => {
      if (filterType !== "all" && doc.type !== filterType) return false;
      return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Use all documents for stats (unfiltered)
  const documentStats = documents.reduce((acc: Record<string, number>, doc) => {
    if (doc.type) {  // Only count non-null types
      acc[doc.type] = (acc[doc.type] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Fixed Header */}
      <div className="flex-none p-6 border-b">
        <h1 className="text-3xl font-bold text-primary mb-4">Document History</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="t4">T4 Forms</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="dental">Dental Claims</SelectItem>
                <SelectItem value="electricity">Utility Bills</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 overflow-hidden p-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex gap-6 h-full">
            {/* Documents Table */}
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
                        {filteredDocuments.length > 0 ? (
                          filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {doc.type === 't4' && <FileStack className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'bank' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'receipt' && <ReceiptText className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'dental' && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'electricity' && <BatteryCharging className="h-4 w-4 text-muted-foreground" />}
                                  <span>{doc.title}</span>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{doc.type}</TableCell>
                              <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewDocument(doc)}
                                  >
                                    <FileSearch className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteDoc(doc)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="h-8 w-8 mb-2" />
                                <p>No documents found</p>
                                {searchQuery && <p className="text-sm">Try adjusting your search or filters</p>}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side Stats */}
            <div className="w-80 flex-none space-y-6">
              {/* Document Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(documentStats).length > 0 ? (
                      Object.entries(documentStats).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {type === 't4' && <FileStack className="h-4 w-4 text-muted-foreground" />}
                            {type === 'bank' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                            {type === 'receipt' && <ReceiptText className="h-4 w-4 text-muted-foreground" />}
                            {type === 'dental' && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                            {type === 'electricity' && <BatteryCharging className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-muted-foreground capitalize">{type}</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <TableIcon className="h-8 w-8 mx-auto mb-2" />
                        <p>No document types to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      documents.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {doc.type === 't4' && <FileStack className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'bank' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'receipt' && <ReceiptText className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'dental' && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'electricity' && <BatteryCharging className="h-4 w-4 text-muted-foreground" />}
                            <span className="font-medium truncate">{doc.title}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="capitalize">{doc.type}</span>
                            <span>{new Date(doc.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2" />
                        <p>No recent activity to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document
              "{deleteDoc?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0 [&>button]:hidden">
          <div className="flex flex-col h-full">
            <div className="flex-none p-6 border-b bg-background">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  {selectedDoc?.title || "Document Preview"}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeTab === 'json' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('json')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant={activeTab === 'markdown' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('markdown')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Markdown
                  </Button>
                  <Button
                    variant={activeTab === 'formatted' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('formatted')}
                  >
                    <TableIcon className="h-4 w-4 mr-2" />
                    Formatted
                  </Button>
                  <Button
                    variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('analysis')}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Analysis
                  </Button>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-6">
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
                          className="absolute right-2 top-2 z-10"
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedDoc?.contentJson, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <div className="max-h-[calc(90vh-10rem)] overflow-auto">
                          <pre className="bg-muted p-4 rounded-lg">
                            <code className="text-sm">
                              {JSON.stringify(selectedDoc?.contentJson, null, 2)}
                            </code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                    {activeTab === 'markdown' && (
                      <motion.div
                        key="markdown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2 z-10"
                          onClick={() => navigator.clipboard.writeText(generateMarkdown(selectedDoc?.contentJson))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <div className="max-h-[calc(90vh-10rem)] overflow-auto">
                          <pre className="bg-muted p-4 rounded-lg">
                            <code className="text-sm whitespace-pre">
                              {generateMarkdown(selectedDoc?.contentJson)}
                            </code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                    {activeTab === 'formatted' && (
                      <motion.div
                        key="formatted"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-h-[calc(90vh-10rem)] overflow-auto pr-4"
                      >
                        {generateFormattedView(selectedDoc?.contentJson)}
                      </motion.div>
                    )}
                    {activeTab === 'analysis' && (
                      <motion.div
                        key="analysis"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6 max-h-[calc(90vh-10rem)] overflow-auto pr-4"
                      >
                        <div>
                          <h3 className="text-lg font-medium mb-2">Summary</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoc?.contentJson?.analysis?.summary || "No summary available"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedDoc?.contentJson?.analysis?.keywords?.length > 0 ? (
                              selectedDoc.contentJson.analysis.keywords.map((keyword: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                                >
                                  {keyword}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No keywords available</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Insights</h3>
                          <div className="space-y-2">
                            {selectedDoc?.contentJson?.analysis?.insights?.length > 0 ? (
                              selectedDoc.contentJson.analysis.insights.map((insight: string, index: number) => (
                                <p key={index} className="text-sm text-muted-foreground">
                                  • {insight}
                                </p>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No insights available</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Confidence Score</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoc?.contentJson?.analysis?.confidenceScore 
                              ? `${(selectedDoc.contentJson.analysis.confidenceScore * 100).toFixed(1)}%`
                              : "No confidence score available"}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('json');
  const [extractedText, setExtractedText] = useState<string>("");
  const [selectedType, setSelectedType] = useState<DocumentType>(null);
  const [error, setError] = useState<string | null>(null);
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
  const [showHistory, setShowHistory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  const validateFileType = (file: File): boolean => {
    const supportedTypes = {
      'image/jpeg': true,
      'image/png': true,
      'image/gif': true,
      'image/webp': true,
      'application/pdf': true
    } as const;
    
    if (!(file.type in supportedTypes)) {
      setError(`Unsupported file type: ${file.type}. Please upload a PDF or image file (JPG, PNG, GIF, WebP).`);
      return false;
    }
    return true;
  };

  const validateDocumentContent = (result: any): boolean => {
    if (!result.analysis?.documentType) {
      setError('Unable to determine document type. Please ensure you uploaded the correct document.');
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
      setError(`This document appears to be a "${detectedType}" which doesn't match the selected document type "${documentTypeLabels[selectedType as keyof typeof documentTypeLabels].title}". Please verify and try again.`);
      return false;
    }

    return true;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const droppedFile = acceptedFiles[0];
      setError(null); // Clear any previous errors
      
      if (droppedFile) {
        if (!validateFileType(droppedFile)) {
          return;
        }

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
            // Validate document content before proceeding
            if (!validateDocumentContent(result)) {
              setFile(null);
              setIsProcessing(false);
              return;
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
            throw new Error(result.error || 'Analysis failed');
          }
        } catch (error) {
          console.error("Error analyzing document:", error);
          setError(error instanceof Error ? error.message : 'An unexpected error occurred');
          setFile(null);
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
    setError(null);
    setIsSaved(false);
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
    if (demoType === 'history') {
      setShowHistory(true);
      setSelectedType('history');
      return;
    }
    setShowHistory(false);
    // Set the selected type and reset states
    setSelectedType(demoType as DocumentType);
    resetStates();
    setFile(null);
  };

  const handleSaveDocument = async () => {
    if (!user || !selectedType || !aiInsights.contentJson || isSaved) return;

    try {
      setIsProcessing(true);
      // Combine the content and analysis data
      const contentWithAnalysis = {
        ...aiInsights.contentJson,
        analysis: {
          summary: aiInsights.summary,
          keywords: aiInsights.keywords,
          insights: aiInsights.rawJson?.analysis?.insights || [],
          confidenceScore: aiInsights.rawJson?.analysis?.confidenceScore || 0,
          documentType: aiInsights.rawJson?.analysis?.documentType || selectedType
        }
      };

      const documentData = {
        title: file?.name || `${selectedType.toUpperCase()} Document`,
        type: selectedType,
        date: new Date().toISOString(),
        confidence: aiInsights.rawJson?.analysis?.confidenceScore ? 
          Math.round(aiInsights.rawJson.analysis.confidenceScore * 100) : 95,
        contentJson: contentWithAnalysis
      };

      console.log('Saving document with data:', documentData);

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
        console.error('Server response:', errorData);
        throw new Error(errorData.error || 'Failed to save document');
      }

      const result = await response.json();
      console.log('Document saved successfully:', result);

      setIsSaved(true);
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
    const jsonString = JSON.stringify(aiInsights.contentJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'document'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const markdownContent = generateMarkdown(aiInsights.contentJson);
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const content = aiInsights.contentJson;
    let csvContent = '';
    
    // Add metadata
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

    // Add content
    if (content.content) {
      csvContent += 'Content\n';
      Object.entries(content.content).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array of objects
          const headers = Object.keys(value[0] || {});
          csvContent += `${key}\n${headers.join(',')}\n`;
          value.forEach(item => {
            csvContent += `${Object.values(item).join(',')}\n`;
          });
        } else if (typeof value === 'object') {
          // Handle object
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
    a.download = `${file?.name || 'document'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showHistory) {
    if (!user) {
      return (
        <div className="flex h-full overflow-hidden bg-background">
          <CustomSidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onSelectDemo={handleDemoSelect}
            selectedType="history"
          />
          
          <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl"
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                    <History className="h-6 w-6" />
                    Document History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Sign in to view and manage your document history
                    </p>
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full max-w-sm"
                    >
                      Sign In
                    </Button>
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
          selectedType="history"
        />
        <HistorySection />
      </div>
    );
  }

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
                  {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
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
                                <div className="w-full max-w-xl bg-muted/50 rounded-lg border-2 border-border p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        {selectedType === 't4' && <FileStack className="h-5 w-5 text-primary" />}
                                        {selectedType === 'bank' && <Building2 className="h-5 w-5 text-primary" />}
                                        {selectedType === 'receipt' && <ReceiptText className="h-5 w-5 text-primary" />}
                                        {selectedType === 'dental' && <Stethoscope className="h-5 w-5 text-primary" />}
                                        {selectedType === 'electricity' && <BatteryCharging className="h-5 w-5 text-primary" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type.split('/')[1].toUpperCase()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFile(null);
                                        }}
                                      >
                                        Change File
                                      </Button>
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
                                  </div>
                                  {isProcessing && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="mt-4"
                                    >
                                      <Progress value={progress} className="h-1" />
                                      <p className="text-xs text-muted-foreground mt-2 text-center">
                                        Analyzing document... {progress}%
                                      </p>
                                    </motion.div>
                                  )}
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
                        <TableIcon className="h-4 w-4" />
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
                            <p className="text-sm text-muted-foreground">
                              {aiInsights.summary}
                            </p>
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
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={downloadJson}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Download JSON
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={downloadMarkdown}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Markdown
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={downloadCsv}
                    >
                      <TableIcon className="mr-2 h-4 w-4" />
                      Download CSV
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

              <Card>
                <CardHeader>
                  <CardTitle>Save Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {isSaved 
                        ? "Document has been saved to your history" 
                        : "Save this document to your history for future reference"}
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={handleSaveDocument}
                      disabled={!user || isSaved || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCcw className="mr-2 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <Save className="mr-2 h-4 w-4 text-green-500" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {user ? 'Save Document' : 'Sign in to Save'}
                        </>
                      )}
                    </Button>
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